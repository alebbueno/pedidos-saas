import { getOrders, getOwnerRestaurant } from '@/actions/admin'
import { redirect } from 'next/navigation'
import OrdersBoard from './orders-board'

export default async function OrdersPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) redirect('/login?error=no_restaurant')

    const orders = await getOrders(restaurant.id)

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Gestão de Pedidos</h1>
                <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-2 font-medium">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Tempo Real Ativo
                </div>
            </div>

            <OrdersBoard initialOrders={orders} restaurantId={restaurant.id} />
        </div>
    )
}
