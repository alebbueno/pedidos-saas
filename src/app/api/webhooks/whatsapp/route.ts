import { processAgentMessage } from '@/lib/agent'
import { NextResponse } from 'next/server'

// Evolution API Webhook Handler
export async function POST(req: Request) {
    try {
        const url = new URL(req.url)
        const restaurantId = url.searchParams.get('restaurantId')
        // const instanceName = url.searchParams.get('instance') || 'default' 

        if (!restaurantId) {
            return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 })
        }

        const data = await req.json()

        // Check if it's a message
        if (data.type !== 'message') {
            return NextResponse.json({ status: 'ignored', reason: 'not_message' })
        }

        const messageData = data.data
        const sender = messageData.key.remoteJid // e.g., 5511999999999@s.whatsapp.net
        const senderNumber = sender.replace('@s.whatsapp.net', '')

        // Extract text content
        const content = messageData.message?.conversation ||
            messageData.message?.extendedTextMessage?.text ||
            ''

        if (!content) {
            return NextResponse.json({ status: 'ignored', reason: 'no_content' })
        }

        // Process with Agent
        const response = await processAgentMessage(restaurantId, senderNumber, content)

        if (response.reply) {
            // Send back via Evolution API
            const evolutionUrl = process.env.EVOLUTION_API_URL
            const evolutionKey = process.env.EVOLUTION_API_KEY
            const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'MyInstance'

            if (evolutionUrl && evolutionKey) {
                await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': evolutionKey
                    },
                    body: JSON.stringify({
                        number: senderNumber,
                        options: {
                            delay: 1200,
                            presence: 'composing',
                            linkPreview: false
                        },
                        textMessage: {
                            text: response.reply
                        }
                    })
                })
            } else {
                console.log('Evolution API not configured. Reply would be:', response.reply)
            }
        }

        return NextResponse.json({ status: 'success' })

    } catch (error) {
        console.error('Webhook Error', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
