'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Volume2 } from 'lucide-react'

interface GlobalOrderNotificationsProps {
    restaurantId: string
}

export function GlobalOrderNotifications({ restaurantId }: GlobalOrderNotificationsProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio('/sounds/ching.mp3')
        if (audioRef.current) {
            audioRef.current.volume = 0.6
        }
    }, [])

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch((e) => {
                console.error('Error playing sound:', e)
                // Just log, don't toast error globally to avoid annoying user if interaction hasn't happened yet
            })
        }
    }

    useEffect(() => {
        if (!restaurantId) {
            console.log('❌ GlobalNotifications: No restaurantId provided')
            return
        }

        console.log('🔌 GlobalNotifications: Subscribing to orders for restaurant', restaurantId)

        const supabase = createClient()
        const channel = supabase.channel('global-orders')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'orders',
                filter: `restaurant_id=eq.${restaurantId}`
            }, async (payload) => {
                console.log('🔔 GlobalNotifications: New Order Event!', payload)
                const newOrder = payload.new

                // Fetch customer details for the notification
                const { data: fullOrder } = await supabase
                    .from('orders')
                    .select('customer: customers(name)')
                    .eq('id', newOrder.id)
                    .single()

                const customer = Array.isArray(fullOrder?.customer)
                    ? fullOrder?.customer[0]
                    : fullOrder?.customer

                const customerName = customer?.name || 'Cliente'

                playSound()

                toast.success('Novo Pedido Recebido! 💰', {
                    description: `Cliente: ${customerName} - R$ ${Number(newOrder.total_amount).toFixed(2)}`,
                    duration: 10000,
                    style: { backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46' },
                    action: {
                        label: 'Ver Pedido',
                        onClick: () => router.push('/dashboard/orders')
                    }
                })
            })
            .subscribe((status) => {
                console.log('🔌 GlobalNotifications Status:', status)
            })

        return () => {
            console.log('🔌 GlobalNotifications: Unsubscribing')
            supabase.removeChannel(channel)
        }
    }, [restaurantId, router])

    // Hidden test button for unlocking audio context (optional, but good to have in valid DOM)
    // We can expose a global event or just let the user interact normally with the app.
    // For now, return null as the "Test Button" is on the Orders page.
    return null
}
