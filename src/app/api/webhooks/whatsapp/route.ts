import { NextResponse } from 'next/server'

// Evolution API Webhook Handler
export async function POST(req: Request) {
    try {
        const url = new URL(req.url)
        const restaurantId = url.searchParams.get('restaurantId')

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

        // Process with new Agent API (which automatically recognizes customers by phone)
        // Import and call the agent handler directly
        const { POST: agentPOST } = await import('@/app/api/agent/route')
        const agentRequest = new Request('http://localhost/api/agent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                restaurantId,
                phoneNumber: senderNumber,
                message: content,
            }),
        })

        const agentResponse = await agentPOST(agentRequest)
        const agentData = await agentResponse.json()

        if (agentData.error) {
            console.error('Agent API error:', agentData.error)
            return NextResponse.json({ status: 'error', reason: 'agent_failed' })
        }

        if (agentData.reply) {
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
                            text: agentData.reply
                        }
                    })
                })
            } else {
                console.log('Evolution API not configured. Reply would be:', agentData.reply)
            }
        }

        return NextResponse.json({ status: 'success' })

    } catch (error) {
        console.error('Webhook Error', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
