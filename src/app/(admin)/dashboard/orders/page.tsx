import { getOrders, getOwnerRestaurant, updateOrderStatus } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'
import OrderCard from '@/components/admin/order-card' // To create

export default async function OrdersPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) redirect('/login?error=no_restaurant')

    const orders = await getOrders(restaurant.id)

    const columns = [
        { id: 'new', label: 'Novos', color: 'bg-blue-100 text-blue-800' },
        { id: 'preparing', label: 'Em Preparo', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'delivery', label: 'Em Entrega', color: 'bg-orange-100 text-orange-800' },
        { id: 'completed', label: 'Finalizados', color: 'bg-green-100 text-green-800' },
    ]

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Gestão de Pedidos</h1>
                <div className="text-sm text-gray-500">
                    Atualizado a cada 5s
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-[1200px] h-full">
                    {columns.map(col => {
                        const colOrders = orders.filter((o: any) => o.status === col.id)
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
        </div>
    )
}
