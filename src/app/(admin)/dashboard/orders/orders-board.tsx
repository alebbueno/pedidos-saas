'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import OrderCard from '@/components/admin/order-card'
import { toast } from 'sonner'
import { Volume2 } from 'lucide-react'

interface OrdersBoardProps {
    initialOrders: any[]
    restaurantId: string
}

export default function OrdersBoard({ initialOrders, restaurantId }: OrdersBoardProps) {
    const [orders, setOrders] = useState(initialOrders)
    // Audio and notifications are now handled globally in AdminLayout    


    useEffect(() => {
        const supabase = createClient()
        const channel = supabase.channel('realtime-orders')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: `restaurant_id=eq.${restaurantId}`
            }, async (payload) => {
                const { eventType, new: newRecord } = payload

                if (eventType === 'INSERT') {
                    // Fetch full data for the new order (relations not included in payload)
                    const { data: fullOrder } = await supabase
                        .from('orders')
                        .select(`
                            *,
                            items: order_items (
                                *,
                                product: products(name)
                            ),
                            customer: customers(name, phone, address)
                        `)
                        .eq('id', newRecord.id)
                        .single()

                    if (fullOrder) {
                        setOrders(prev => [fullOrder, ...prev])
                    }
                } else if (eventType === 'UPDATE') {
                    // Update state ensuring we preserve existing data structure
                    setOrders(prev => prev.map(o => {
                        if (o.id === newRecord.id) {
                            // Merge new record fields into existing order object
                            return { ...o, ...newRecord }
                        }
                        return o
                    }))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [restaurantId])

    const columns = [
        { id: 'pending', label: 'Novos', color: 'bg-blue-100 text-blue-800' },
        { id: 'preparing', label: 'Em Preparo', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'delivery', label: 'Em Entrega', color: 'bg-orange-100 text-orange-800' },
        { id: 'completed', label: 'Finalizados', color: 'bg-green-100 text-green-800' },
    ]

    return (
        <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex justify-end px-4 mb-2">
                <button
                    onClick={() => {
                        const audio = new Audio('/sounds/ching.mp3')
                        audio.volume = 0.6
                        audio.play().catch(e => console.error(e))
                        toast.success('Som de notificação testado!')
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                >
                    <Volume2 size={16} />
                    Testar Som
                </button>
            </div>
            <div className="flex gap-6 min-w-[1200px] h-full">
                {columns.map(col => {
                    const colOrders = orders.filter((o: any) => (o.status || 'pending') === col.id)
                    return (
                        <div key={col.id} className="flex-1 bg-gray-100/50 rounded-2xl border border-gray-200/60 p-4 flex flex-col h-[calc(100vh-180px)] shadow-inner">
                            <div className={`mb-4 px-4 py-3 rounded-xl font-bold flex justify-between items-center shadow-sm ${col.color}`}>
                                <span>{col.label}</span>
                                <span className="bg-white/30 px-2 py-0.5 rounded text-sm text-inherit">{colOrders.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {colOrders.map((order: any) => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                                {colOrders.length === 0 && (
                                    <div className="h-24 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                                        Vazio
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
