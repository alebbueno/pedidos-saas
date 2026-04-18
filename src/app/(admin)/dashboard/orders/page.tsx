import { getOrders, getOwnerRestaurant } from '@/actions/admin'
import { redirect } from 'next/navigation'
import OrdersBoard from './orders-board'

export default async function OrdersPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) redirect('/login?error=no_restaurant')

    const orders = await getOrders(restaurant.id)

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold leading-tight text-transparent sm:text-3xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                    Gestão de Pedidos
                </h1>
                <div className="shrink-0 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 flex w-fit items-center gap-2 font-medium">
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
