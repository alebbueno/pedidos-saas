'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getOrCreateConversation, getConversationHistory, clearConversation } from '@/actions/conversation-actions'
import { Bot, Send, RotateCcw, Loader2, Signal, Wifi, Battery } from 'lucide-react'
import { format } from 'date-fns'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
}

interface MobileSimulatorProps {
    restaurantId: string
    restaurantName: string
}

export default function MobileSimulator({ restaurantId, restaurantName }: MobileSimulatorProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [testPhone, setTestPhone] = useState('5511999999999') // Default test number
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (restaurantId && testPhone) {
            initializeConversation()
        }
    }, [restaurantId, testPhone])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    async function initializeConversation() {
        if (!testPhone) return

        try {
            // Normalize phone: remove all non-digit characters
            const cleanPhone = testPhone.replace(/\D/g, '')
            
            // Include restaurantId in phone to isolate tests per restaurant even with same number
            // But store the clean phone separately for customer lookup
            const uniqueTestPhone = `${cleanPhone}-${restaurantId}`
            const { data } = await getOrCreateConversation(restaurantId, uniqueTestPhone)

            if (data) {
                setConversationId(data.id)
                await loadHistory(data.id)
            }
        } catch (error) {
            console.error('Error initializing conversation:', error)
        }
    }

    async function loadHistory(convId: string) {
        try {
            const { data } = await getConversationHistory(convId)
            if (data) {
                setMessages(
                    data
                        .filter((msg) => msg.role !== 'system')
                        .map((msg) => ({
                            id: msg.id,
                            role: msg.role as 'user' | 'assistant',
                            content: msg.content,
                            created_at: msg.created_at,
                        }))
                )
            }
        } catch (error) {
            console.error('Error loading history:', error)
        }
    }

    async function sendMessage(e?: React.FormEvent) {
        e?.preventDefault()
        if (!input.trim() || !conversationId) return

        const userMessage = input.trim()
        setInput('')
        setLoading(true)

        // Optimistically add user message
        const tempUserMsg: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: userMessage,
            created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, tempUserMsg])

        try {
            // Extract clean phone number (remove restaurantId suffix if present)
            const cleanPhone = testPhone.replace(/\D/g, '').split('-')[0]
            const uniqueTestPhone = `${cleanPhone}-${restaurantId}`
            
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId,
                    conversationId,
                    message: userMessage,
                    phoneNumber: uniqueTestPhone,
                    // Also send clean phone for customer lookup
                    cleanPhoneNumber: cleanPhone
                }),
            })

            const data = await response.json()

            if (data.reply) {
                const assistantMsg: Message = {
                    id: `temp-${Date.now()}-assistant`,
                    role: 'assistant',
                    content: data.reply,
                    created_at: new Date().toISOString(),
                }
                setMessages((prev) => [...prev, assistantMsg])
            }
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleRestart() {
        if (!conversationId) return
        setLoading(true)
        try {
            await clearConversation(conversationId)
            setMessages([])
            // Send initial greeting trigger if desired, or just wait for user
        } catch (error) {
            console.error('Error clearing conversation:', error)
        } finally {
            setLoading(false)
        }
    }

    function scrollToBottom() {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    return (
        <div className="mx-auto w-[320px] h-[640px] bg-black rounded-[40px] p-3 shadow-2xl border-4 border-gray-800 relative">
            {/* Phone Frame Content */}
            <div className="w-full h-full bg-[#E5DDD5] rounded-[32px] overflow-hidden flex flex-col relative z-10">
                {/* Status Bar */}
                <div className="bg-[#075E54] text-white px-5 py-2 flex justify-between items-center text-xs h-[40px]">
                    <div className="font-semibold">{format(new Date(), 'HH:mm')}</div>
                    <div className="flex gap-1.5">
                        <Signal className="w-3.5 h-3.5" />
                        <Wifi className="w-3.5 h-3.5" />
                        <Battery className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* WhatsApp Header */}
                <div className="bg-[#075E54] text-white px-3 py-2 flex items-center gap-3 shadow-md z-20">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{restaurantName}</div>
                        <div className="text-xs text-white/80 flex items-center gap-2">
                            {loading ? 'Digitando...' : 'Online'}
                            <span className="opacity-50">•</span>
                            <Input
                                className="h-5 w-24 text-[10px] bg-white/10 border-none text-white placeholder:text-white/50 px-1 py-0 focus-visible:ring-0 focus-visible:bg-white/20"
                                placeholder="Seu Número"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 w-8 h-8 rounded-full"
                        onClick={handleRestart}
                        title="Reiniciar conversa"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>

                {/* Chat Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#E5DDD5] bg-opacity-90"
                    style={{
                        backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '400px'
                    }}
                >
                    {messages.length === 0 && (
                        <div className="bg-[#DCF8C6] shadow-sm rounded-lg p-3 text-xs text-center mx-4 my-4 opacity-90 border border-yellow-100">
                            🔒 As mensagens são protegidas com criptografia de ponta a ponta.
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                                    max-w-[85%] rounded-lg px-3 py-1.5 shadow-sm text-sm relative
                                    ${message.role === 'user'
                                        ? 'bg-[#DCF8C6] rounded-tr-none'
                                        : 'bg-white rounded-tl-none'
                                    }
                                `}
                            >
                                <p className="whitespace-pre-wrap break-words text-gray-800 leading-snug">
                                    {message.content}
                                </p>
                                <p className={`text-[10px] text-right mt-0.5 ${message.role === 'user' ? 'text-green-800/60' : 'text-gray-400'}`}>
                                    {format(new Date(message.created_at), 'HH:mm')}
                                </p>

                                {/* Tail triangle */}
                                <div className={`absolute top-0 w-0 h-0 border-[6px] border-transparent 
                                    ${message.role === 'user'
                                        ? 'right-[-6px] border-t-[#DCF8C6]'
                                        : 'left-[-6px] border-t-white'
                                    }`}
                                />
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-white rounded-lg rounded-tl-none px-4 py-2 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="bg-[#F0F0F0] p-2 flex items-center gap-2 z-20">
                    <form onSubmit={sendMessage} className="flex-1 flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Mensagem"
                            className="flex-1 bg-white border-none rounded-full h-9 text-sm focus-visible:ring-0 px-4"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim() || loading}
                            className="h-9 w-9 rounded-full bg-[#075E54] hover:bg-[#128C7E] flex-shrink-0"
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </Button>
                    </form>
                </div>
            </div>

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[25px] bg-black rounded-b-[20px] z-30 pointer-events-none"></div>

            {/* Home Bar */}
            <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-gray-600 rounded-full z-30 pointer-events-none"></div>
        </div>
    )
}
