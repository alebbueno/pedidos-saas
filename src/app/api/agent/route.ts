import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAgentConfig } from '@/actions/agent-config-actions'
import { buildSystemPrompt } from '@/lib/agent-utils'
import {
    getOrCreateConversation,
    getConversationHistory,
    addMessage,
} from '@/actions/conversation-actions'
import {
    agentFunctions,
    executeAgentFunction,
    listProducts,
    formatOrderSummary,
} from '@/lib/agent-functions'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
})

export async function POST(req: Request) {
    try {
        const { restaurantId, message, conversationId, phoneNumber, customerId, cleanPhoneNumber } = await req.json()

        if (!restaurantId || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get or create conversation
        let conversation
        if (conversationId) {
            const { data } = await supabase
                .from('ai_conversations')
                .select('*')
                .eq('id', conversationId)
                .single()
            conversation = data
        } else if (phoneNumber) {
            const { data } = await getOrCreateConversation(restaurantId, phoneNumber, customerId)
            conversation = data
        } else {
            return NextResponse.json(
                { error: 'Either conversationId or phoneNumber is required' },
                { status: 400 }
            )
        }

        if (!conversation) {
            return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
        }

        // Get agent configuration
        const { data: agentConfig } = await getAgentConfig(restaurantId)
        if (!agentConfig) {
            return NextResponse.json({ error: 'Agent not configured' }, { status: 500 })
        }

        // Get conversation history - limit to last 20 messages to avoid context overflow
        const { data: historyData } = await getConversationHistory(conversation.id)
        const allHistory = (historyData || []).map((msg) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
        }))

        // Keep only the last 20 messages (excluding system messages)
        // This prevents context length overflow
        const recentHistory = allHistory
            .filter(msg => msg.role !== 'system')
            .slice(-20)

        const history = recentHistory

        // Get products for context - limit to essential info to reduce token usage
        const { products } = await listProducts(restaurantId)
        const menuContext = products
            .slice(0, 50) // Limit to first 50 products to reduce context
            .map((p: any) => {
                // Simplified format to reduce tokens
                let productInfo = `- ${p.name} (R$ ${p.base_price.toFixed(2)})`
                if (p.description) {
                    // Truncate description to max 100 chars
                    const desc = p.description.length > 100 ? p.description.substring(0, 100) + '...' : p.description
                    productInfo += `: ${desc}`
                }

                // Only mention if has options, don't list all options to save tokens
                if (p.product_option_groups && p.product_option_groups.length > 0) {
                    productInfo += ' [Tem opções]'
                }

                return productInfo
            })
            .join('\n')

        // Get restaurant details
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', restaurantId)
            .single()

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
        }

        // Get customer context if available
        let customerContext = ''
        if (conversation.customer_id) {
            const { getCustomerContext } = await import('@/actions/conversation-actions')
            const contextData = await getCustomerContext(conversation.customer_id)

            if (contextData) {
                // Use the formatted context which includes all customer information
                customerContext = contextData.formatted_context || ''

                console.log('[Agent] Customer context loaded:', {
                    customerId: conversation.customer_id,
                    name: contextData.name,
                    hasAddresses: (contextData.addresses || []).length > 0,
                    orderCount: (contextData.last_orders || []).length,
                    contextLength: customerContext.length,
                    contextPreview: customerContext.substring(0, 150)
                })
            } else {
                console.warn('[Agent] customer_id exists but getCustomerContext returned null:', conversation.customer_id)
            }
        } else if (phoneNumber) {
            // Extract clean phone number (remove restaurantId suffix if present)
            // The phoneNumber might be in format: "5511965671180-restaurantId"
            let phoneToSearch = cleanPhoneNumber || phoneNumber

            // If no cleanPhoneNumber provided, try to extract from phoneNumber
            if (!cleanPhoneNumber && phoneNumber.includes('-')) {
                // Extract the phone part before the first hyphen
                phoneToSearch = phoneNumber.split('-')[0]
            }

            // Normalize: remove all non-digit characters
            phoneToSearch = phoneToSearch.replace(/\D/g, '')

            console.log('[Agent] No customer_id in conversation, trying to find by phone:', {
                original: phoneNumber,
                cleanPhoneNumber,
                extracted: phoneToSearch
            })

            const { getCustomerByPhone } = await import('@/actions/customer')
            const { success, customer, error: customerError } = await getCustomerByPhone(phoneToSearch)

            if (customerError) {
                console.error('[Agent] Error finding customer:', customerError)
            }

            if (success && customer) {
                console.log('[Agent] Customer found by phone:', {
                    id: customer.id,
                    name: customer.name,
                    phone: customer.phone
                })

                // Update conversation with customer_id
                const { error: updateError } = await supabase
                    .from('ai_conversations')
                    .update({ customer_id: customer.id })
                    .eq('id', conversation.id)

                if (updateError) {
                    console.error('[Agent] Error updating conversation with customer_id:', updateError)
                } else {
                    console.log('[Agent] Conversation updated with customer_id:', customer.id)
                }

                // Get full context
                const { getCustomerContext } = await import('@/actions/conversation-actions')
                const contextData = await getCustomerContext(customer.id)

                if (contextData) {
                    customerContext = contextData.formatted_context || ''
                    console.log('[Agent] Customer context loaded:', {
                        name: contextData.name,
                        hasAddresses: (contextData.addresses || []).length > 0,
                        orderCount: (contextData.last_orders || []).length,
                        contextLength: customerContext.length
                    })
                } else {
                    console.warn('[Agent] Customer found but getCustomerContext returned null')
                }
            } else {
                console.log('[Agent] No customer found for phone:', phoneNumber)
            }
        }

        // Build system prompt
        console.log('[Agent] Customer Context for prompt:', {
            hasContext: !!customerContext,
            contextLength: customerContext?.length || 0,
            contextPreview: customerContext?.substring(0, 200) || 'N/A'
        })
        const systemPrompt = buildSystemPrompt(agentConfig, restaurant, menuContext, customerContext)

        // Log if customer context is missing but should be there
        if (!customerContext && conversation.customer_id) {
            console.warn('[Agent] WARNING: customer_id exists but no context was loaded!', conversation.customer_id)
        }

        // Log the system prompt preview to verify customer context is included
        if (customerContext) {
            console.log('[Agent] System prompt includes customer context:', systemPrompt.includes('ALESSANDRO BUENO') || systemPrompt.includes('NOME DO CLIENTE'))
        }

        // Add user message to history
        await addMessage(conversation.id, 'user', message)

        // Mock response if no API key
        if (!process.env.OPENAI_API_KEY) {
            const mockReply =
                'Olá! Sou o atendente virtual. (Configure a OPENAI_API_KEY para me ativar de verdade). O que gostaria de pedir?'
            await addMessage(conversation.id, 'assistant', mockReply)
            return NextResponse.json({
                reply: mockReply,
                conversationId: conversation.id,
            })
        }

        // Call OpenAI with function calling
        let messages: any[] = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: message },
        ]

        let functionCallCount = 0
        const maxFunctionCalls = 5
        let finalReply = ''
        let orderAlreadyConfirmed = false // Flag to prevent multiple confirmations

        while (functionCallCount < maxFunctionCalls) {
            console.log(`[Agent] Calling OpenAI (attempt ${functionCallCount + 1}/${maxFunctionCalls})`)

            const completion = await openai.chat.completions.create({
                messages,
                model: 'gpt-3.5-turbo',
                functions: agentFunctions,
                function_call: 'auto',
                temperature: 0.7, // Slightly lower temperature for more consistent function calling
            })

            console.log(`[Agent] OpenAI response:`, {
                hasFunctionCall: !!completion.choices[0].message.function_call,
                functionName: completion.choices[0].message.function_call?.name || null,
                hasContent: !!completion.choices[0].message.content
            })

            const responseMessage = completion.choices[0].message

            // Check if user message contains confirmation words and we have a draft
            // Only do this ONCE per request to avoid multiple order creations
            const confirmationWords = ['sim', 'confirmo', 'confirma', 'pode confirmar', 'está certo', 'pode fazer', 'fazer', 'pode', 'ok', 'tudo certo']
            const userMessageLower = message.toLowerCase()
            const hasConfirmation = confirmationWords.some(word => userMessageLower.includes(word))

            // If no function call but user confirmed and we have a draft, force confirm_order
            // BUT only if we haven't already confirmed an order in this request
            if (!responseMessage.function_call && hasConfirmation && !orderAlreadyConfirmed) {
                const { getConversation } = await import('@/actions/conversation-actions')
                const { data: currentConv } = await getConversation(conversation.id)

                // Check if conversation is already completed (order already confirmed)
                if (currentConv?.status === 'completed') {
                    console.log('[Agent] Conversation already completed, skipping auto-confirm')
                } else if (currentConv?.current_order_draft && currentConv.current_order_draft.items?.length > 0) {
                    console.log('[Agent] Detected confirmation in message, forcing confirm_order call')
                    orderAlreadyConfirmed = true // Set flag to prevent multiple confirmations

                    // Force function call by adding it to messages
                    messages.push({
                        role: 'assistant',
                        function_call: {
                            name: 'confirm_order',
                            arguments: JSON.stringify({ confirmed: true })
                        },
                        content: null
                    })

                    // Execute confirm_order
                    const functionResult = await executeAgentFunction(
                        'confirm_order',
                        { confirmed: true },
                        restaurantId,
                        conversation.id
                    )

                    console.log(`[Agent] Function confirm_order result:`, {
                        success: 'success' in functionResult ? functionResult.success : 'unknown',
                        hasOrderId: 'order_id' in functionResult,
                        orderId: 'order_id' in functionResult ? functionResult.order_id : null
                    })

                    // Add function result to messages
                    messages.push({
                        role: 'function',
                        name: 'confirm_order',
                        content: JSON.stringify(functionResult),
                    })

                    // Continue loop to generate final message
                    functionCallCount++
                    continue
                }
            }

            // If no function call, we have the final response
            if (!responseMessage.function_call) {
                finalReply = responseMessage.content || 'Desculpe, não entendi. Pode repetir?'
                break
            }

            // Execute function
            const functionName = responseMessage.function_call.name
            let functionArgs = {}
            try {
                functionArgs = JSON.parse(responseMessage.function_call.arguments || '{}')
            } catch (e) {
                console.error('Error parsing function arguments:', e)
                // Continue with empty args or try to repair if needed, but avoid crashing
            }

            console.log(`[Agent] Executing function: ${functionName}`, {
                functionArgs,
                conversationId: conversation.id,
                restaurantId
            })

            const functionResult = await executeAgentFunction(
                functionName,
                functionArgs,
                restaurantId,
                conversation.id
            )

            console.log(`[Agent] Function ${functionName} result:`, {
                success: 'success' in functionResult ? functionResult.success : 'unknown',
                hasOrderId: 'order_id' in functionResult,
                orderId: 'order_id' in functionResult ? functionResult.order_id : null,
                message: 'message' in functionResult ? functionResult.message : null
            })

            // Add function call and result to messages
            messages.push(responseMessage)
            messages.push({
                role: 'function',
                name: functionName,
                content: JSON.stringify(functionResult),
            })

            functionCallCount++

            // If this was confirm_order, format a nice confirmation message
            if (
                functionName === 'confirm_order' &&
                'success' in functionResult &&
                functionResult.success
            ) {
                console.log('[Agent] Order confirmed successfully:', {
                    orderId: 'order_id' in functionResult ? functionResult.order_id : null,
                    orderNumber: 'order_number' in functionResult ? functionResult.order_number : null
                })

                // Get the order draft for summary
                const { data: updatedConv } = await supabase
                    .from('ai_conversations')
                    .select('*')
                    .eq('id', conversation.id)
                    .single()

                if (updatedConv?.current_order_draft) {
                    const orderNumber = 'order_number' in functionResult ? functionResult.order_number :
                        ('order_id' in functionResult ? String(functionResult.order_id).substring(0, 8).toUpperCase() : 'N/A')

                    const summary = formatOrderSummary(
                        updatedConv.current_order_draft.items,
                        updatedConv.current_order_draft.delivery_type,
                        updatedConv.current_order_draft.delivery_address,
                        agentConfig.delivery_fee || 0
                    )

                    // Let AI generate final confirmation message with order number
                    messages.push({
                        role: 'system',
                        content: `O pedido foi confirmado e SALVO no banco de dados com sucesso! Número do pedido: ${orderNumber}. Envie uma mensagem de confirmação amigável ao cliente ${customerContext ? 'usando o nome dele' : ''} informando:
- Que o pedido foi recebido e confirmado
- O número do pedido: ${orderNumber}
- O tempo estimado de entrega é ${agentConfig.avg_delivery_time_minutes || 40} minutos
- Agradeça pela preferência`,
                    })
                }
            }
        }

        // If we exhausted function calls without a reply, generate one
        if (!finalReply && functionCallCount >= maxFunctionCalls) {
            finalReply = 'Desculpe, tive um problema ao processar seu pedido. Pode tentar novamente?'
        }

        // If we still don't have a reply, make one more call
        if (!finalReply) {
            const finalCompletion = await openai.chat.completions.create({
                messages,
                model: 'gpt-3.5-turbo',
            })
            finalReply = finalCompletion.choices[0].message.content || 'Como posso ajudar?'
        }

        // Save assistant response
        await addMessage(conversation.id, 'assistant', finalReply)

        return NextResponse.json({
            reply: finalReply,
            conversationId: conversation.id,
        })
    } catch (error) {
        console.error('Agent error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
