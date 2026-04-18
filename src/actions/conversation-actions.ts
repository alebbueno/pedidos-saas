'use server'

import { createClient } from '@/lib/supabase/server'
import { getCustomerByPhone } from '@/actions/customer'

export interface Conversation {
    id: string
    restaurant_id: string
    customer_id?: string | null
    phone_number: string
    status: 'active' | 'completed' | 'abandoned'
    current_order_draft?: any
    context_data?: any
    started_at: string
    last_message_at: string
    completed_at?: string | null
}

export interface ConversationMessage {
    id: string
    conversation_id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    metadata?: any
    created_at: string
}

/**
 * Create a new conversation
 */
export async function createConversation(
    restaurantId: string,
    phoneNumber: string,
    customerId?: string
) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
            restaurant_id: restaurantId,
            customer_id: customerId,
            phone_number: phoneNumber,
            status: 'active',
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating conversation:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

/**
 * Get or create conversation for a phone number
 */
export async function getOrCreateConversation(
    restaurantId: string,
    phoneNumber: string,
    customerId?: string
) {
    const supabase = await createClient()

    // Try to find active conversation
    const { data: existing } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('phone_number', phoneNumber)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })
        .limit(1)
        .single()

    if (existing) {
        return { data: existing, error: null }
    }

    // Create new conversation
    // First, try to find an existing customer by phone number
    let finalCustomerId = customerId

    if (!finalCustomerId) {
        let phoneToSearch = phoneNumber
        if (phoneNumber.includes('-')) {
            phoneToSearch = phoneNumber.split('-')[0]
        }
        const normalizedPhone = phoneToSearch.replace(/\D/g, '')

        const { success, customer } = await getCustomerByPhone(normalizedPhone, restaurantId)

        if (success && customer) {
            finalCustomerId = customer.id
        }
    }

    return createConversation(restaurantId, phoneNumber, finalCustomerId)
}

/**
 * Get customer context: name, addresses, and order history
 */
export async function getCustomerContext(customerId: string) {
    const supabase = await createClient()

    console.log(`[getCustomerContext] Fetching context for customer: ${customerId}`)

    // Get customer details
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('name, phone, email, created_at, last_order_at')
        .eq('id', customerId)
        .single()

    if (customerError) {
        console.error(`[getCustomerContext] Error fetching customer ${customerId}:`, customerError)
        return null
    }

    if (!customer) {
        console.warn(`[getCustomerContext] Customer ${customerId} not found`)
        return null
    }

    console.log(`[getCustomerContext] Customer found:`, { name: customer.name, phone: customer.phone })

    // Get customer addresses
    const { data: addresses, error: addressesError } = await supabase
        .from('customer_addresses')
        .select('address, street, number, complement, neighborhood, city, is_default')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

    if (addressesError) {
        console.error(`[getCustomerContext] Error fetching addresses:`, addressesError)
    }

    // Get last 5 orders (not just completed, to see recent activity)
    const { data: lastOrders, error: ordersError } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            status,
            delivery_type,
            delivery_address,
            created_at,
            order_items (
                quantity,
                unit_price,
                total_price,
                options_selected,
                products (
                    name
                )
            )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(5)

    if (ordersError) {
        console.error(`[getCustomerContext] Error fetching orders:`, ordersError)
    }

    console.log(`[getCustomerContext] Loaded context:`, {
        addresses: (addresses || []).length,
        orders: (lastOrders || []).length
    })

    // Format order history for context
    const formattedOrders = (lastOrders || []).map((order: any) => {
        const items = (order.order_items || []).map((item: any) => {
            const productName = item.products?.name || 'Produto'
            const options = item.options_selected ? JSON.parse(JSON.stringify(item.options_selected)) : []
            const optionsText = options.length > 0 
                ? ` (${options.map((opt: any) => opt.option_name || opt.name).join(', ')})`
                : ''
            return `${item.quantity}x ${productName}${optionsText}`
        }).join(', ')

        return {
            date: new Date(order.created_at).toLocaleDateString('pt-BR'),
            total: order.total_amount,
            status: order.status,
            delivery_type: order.delivery_type,
            items: items || 'Sem itens',
        }
    })

    // Build context string - DESTACAR O NOME DO CLIENTE
    let context = `🚨 NOME DO CLIENTE: ${customer.name.toUpperCase()} 🚨\nTelefone: ${customer.phone}`
    
    if (customer.email) {
        context += `\nEmail: ${customer.email}`
    }

    if (customer.last_order_at) {
        const lastOrderDate = new Date(customer.last_order_at).toLocaleDateString('pt-BR')
        context += `\nÚltimo pedido: ${lastOrderDate}`
    }

    if (addresses && addresses.length > 0) {
        context += `\n\nEndereços cadastrados (${addresses.length}):`
        addresses.forEach((addr, index) => {
            const fullAddress = addr.address || 
                `${addr.street || ''}, ${addr.number || ''}${addr.complement ? `, ${addr.complement}` : ''}, ${addr.neighborhood || ''}, ${addr.city || ''}`
            context += `\n${index + 1}. ${fullAddress}${addr.is_default ? ' (padrão)' : ''}`
        })
    }

    // Limit order history to last 3 orders to reduce context size
    const limitedOrders = formattedOrders.slice(0, 3)
    if (limitedOrders.length > 0) {
        context += `\n\nHistórico de pedidos (últimos ${limitedOrders.length}):`
        limitedOrders.forEach((order: any, index: number) => {
            context += `\n${index + 1}. ${order.date} - R$ ${order.total.toFixed(2)} (${order.status})`
            // Truncate items if too long
            const itemsText = order.items.length > 150 ? order.items.substring(0, 150) + '...' : order.items
            context += `\n   ${itemsText}`
            if (order.delivery_type === 'delivery') {
                context += `\n   📍 Entrega`
            } else {
                context += `\n   🏪 Retirada`
            }
        })
    } else {
        context += `\n\nEste é um cliente novo, sem histórico de pedidos.`
    }

    return {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        addresses: addresses || [],
        last_orders: lastOrders || [],
        formatted_context: context,
    }
}

/**
 * Get conversation by ID
 */
export async function getConversation(conversationId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

    if (error) {
        console.error('Error fetching conversation:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

/**
 * Get conversation history (messages)
 */
export async function getConversationHistory(conversationId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ai_conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching conversation history:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

/**
 * Add message to conversation
 */
export async function addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ai_conversation_messages')
        .insert({
            conversation_id: conversationId,
            role,
            content,
            metadata,
        })
        .select()
        .single()

    if (error) {
        console.error('Error adding message:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

/**
 * Update conversation order draft
 */
export async function updateOrderDraft(conversationId: string, orderDraft: any) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ai_conversations')
        .update({ current_order_draft: orderDraft })
        .eq('id', conversationId)
        .select()
        .single()

    if (error) {
        console.error('Error updating order draft:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

/**
 * Update conversation status
 */
export async function updateConversationStatus(
    conversationId: string,
    status: 'active' | 'completed' | 'abandoned'
) {
    const supabase = await createClient()

    const updates: any = { status }
    if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('ai_conversations')
        .update(updates)
        .eq('id', conversationId)
        .select()
        .single()

    if (error) {
        console.error('Error updating conversation status:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

/**
 * Clear conversation (for testing)
 */
export async function clearConversation(conversationId: string) {
    const supabase = await createClient()

    // Delete all messages
    const { error: messagesError } = await supabase
        .from('ai_conversation_messages')
        .delete()
        .eq('conversation_id', conversationId)

    if (messagesError) {
        console.error('Error clearing messages:', messagesError)
        return { error: messagesError.message }
    }

    // Reset conversation
    const { error: conversationError } = await supabase
        .from('ai_conversations')
        .update({
            current_order_draft: null,
            context_data: {},
            status: 'active',
        })
        .eq('id', conversationId)

    if (conversationError) {
        console.error('Error resetting conversation:', conversationError)
        return { error: conversationError.message }
    }

    return { error: null }
}

/**
 * Get recent conversations for a restaurant
 */
export async function getRecentConversations(restaurantId: string, limit = 20) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ai_conversations')
        .select(
            `
      *,
      customers (
        name,
        phone
      )
    `
        )
        .eq('restaurant_id', restaurantId)
        .order('last_message_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent conversations:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}
