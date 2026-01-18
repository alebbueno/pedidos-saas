import { createClient } from '@/lib/supabase/server'
import { getMenu } from '@/actions/restaurant'
import OpenAI from 'openai'

// Note: Requires OPENAI_API_KEY in env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key'
})

export async function processAgentMessage(restaurantId: string, customerPhone: string, message: string) {
    const supabase = await createClient()

    // 1. Fetch Restaurant & Menu
    const { data: restaurant } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single()
    if (!restaurant) return { error: 'Restaurant not found' }

    const { products } = await getMenu(restaurantId)

    // 2. Fetch History (Last 10 messages)
    const { data: history } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('restaurant_id', restaurantId)
        .eq('customer_phone', customerPhone)
        .order('created_at', { ascending: false })
        .limit(10)

    const previousMessages = (history || []).reverse().map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    // 3. Construct System Prompt
    const menuContext = products.map(p =>
        `- ${p.name} (R$ ${p.base_price.toFixed(2)}): ${p.description || ''} ${p.product_option_groups.length > 0 ? '[Tem variações]' : ''}`
    ).join('\n')

    const systemPrompt = `
      Você é um atendente virtual do restaurante ${restaurant.name}.
      Seu objetivo é ajudar o cliente a fazer um pedido.
      Seja simpático, breve e use emojis.
      
      Cardápio:
      ${menuContext}

      Regras:
      1. Se o cliente pedir algo, verifique as variações (tamanho, borda) perguntando uma por vez.
      2. Se o pedido estiver completo, peça confirmação e endereço.
      3. IMPORTANTE: Se o cliente confirmar o pedido, você DEVE responder com um resumo e instruir o cliente a enviar 'CONFIRMO O PEDIDO' para oficializar (ou você pode gerar um link se tivéssemos essa feature).
      4. NÃO invente produtos que não estão no cardápio.
    `

    // 4. Save User Message
    await supabase.from('chat_messages').insert({
        restaurant_id: restaurantId,
        customer_phone: customerPhone,
        role: 'user',
        content: message
    })

    // 5. Call OpenAI
    if (!process.env.OPENAI_API_KEY) {
        const mockReply = "Olá! (Configure a OPENAI_API_KEY). Recebi: " + message
        await supabase.from('chat_messages').insert({
            restaurant_id: restaurantId,
            customer_phone: customerPhone,
            role: 'assistant',
            content: mockReply
        })
        return { reply: mockReply }
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...previousMessages,
                { role: 'user', content: message }
            ],
            model: 'gpt-3.5-turbo',
        })

        const reply = completion.choices[0].message.content || "Desculpe, não entendi."

        // 6. Save Assistant Reply
        await supabase.from('chat_messages').insert({
            restaurant_id: restaurantId,
            customer_phone: customerPhone,
            role: 'assistant',
            content: reply
        })

        return { reply }
    } catch (e) {
        console.error('OpenAI Error', e)
        return { error: 'Failed to generate response' }
    }
}
