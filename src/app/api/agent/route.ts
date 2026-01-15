import { createClient } from '@/lib/supabase/server'
import { getMenu } from '@/actions/restaurant'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Note: Requires OPENAI_API_KEY in env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key'
})

export async function POST(req: Request) {
    try {
        const { restaurantId, message, history } = await req.json()
        const supabase = await createClient()

        // Fetch Restaurant & Menu
        const { data: restaurant } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single()
        const { products } = await getMenu(restaurantId)

        // Construct System Prompt
        const menuContext = products.map(p =>
            `- ${p.name} (R$ ${p.base_price}): ${p.description || ''}`
        ).join('\n')

        const systemPrompt = `
      Você é um atendente virtual do restaurante ${restaurant.name}.
      Seu objetivo é ajudar o cliente a fazer um pedido via WhatsApp.
      Seja simpático e breve.
      
      Cardápio:
      ${menuContext}

      Regras:
      1. Se o cliente pedir algo, verifique as variações (tamanho, borda) se necessário.
      2. Se o pedido estiver completo, peça confirmação e endereço.
      3. Se confirmado, responda com um JSON especial NO FINAL da mensagem: {"action": "create_order", "order": ...} 
         (Mas para este MVP, apenas responda com o resumo do pedido em texto).
    `

        // Call OpenAI (Mock if no key)
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                reply: "Olá! Sou a IA do restaurante. (Configure a OPENAI_API_KEY para me ativar de verdade). O que gostaria de pedir?"
            })
        }

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: message }
            ],
            model: 'gpt-3.5-turbo',
        })

        const reply = completion.choices[0].message.content

        return NextResponse.json({ reply })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
