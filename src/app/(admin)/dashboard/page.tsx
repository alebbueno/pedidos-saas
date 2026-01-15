import { getOwnerRestaurant, getOrders } from '@/actions/admin' // getOrders fetches all orders, we can filter here
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, DollarSign, UtensilsCrossed, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) redirect('/onboarding')

    const orders = await getOrders(restaurant.id)

    // Simple stats
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((acc: number, order: any) => acc + (order.status !== 'canceled' ? Number(order.total_amount) : 0), 0)
    const todayOrders = orders.filter((o: any) => {
        const date = new Date(o.created_at)
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }).length

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Visão Geral</h1>
                <div className="flex gap-2">
                    <Link href={`/lp/${restaurant.slug}`} target="_blank">
                        <Button variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver Cardápio
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100 uppercase tracking-wider">Faturamento</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold">R$ {totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-blue-200 mt-1">
                            +12% que mês passado
                        </p>
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <DollarSign className="w-24 h-24 -mr-4 -mb-4" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden relative">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pedidos Hoje</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-gray-900">{todayOrders}</div>
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Em tempo real
                        </p>
                        <div className="absolute right-0 bottom-0 opacity-5">
                            <ShoppingBag className="w-24 h-24 -mr-4 -mb-4 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden relative">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status da Loja</CardTitle>
                        <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${restaurant.is_open ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div className={`text-3xl font-extrabold ${restaurant.is_open ? 'text-green-600' : 'text-red-600'}`}>
                                {restaurant.is_open ? 'Aberto' : 'Fechado'}
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {restaurant.is_open ? 'Recebendo pedidos normalmente' : 'Loja fechada para pedidos'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Últimos Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orders.slice(0, 5).map((order: any) => (
                                <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium text-sm">{order.customer?.name}</p>
                                        <p className="text-xs text-muted-foreground">#{order.id.slice(0, 4)} • {order.status}</p>
                                    </div>
                                    <div className="font-bold">
                                        R$ {Number(order.total_amount).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            {orders.length === 0 && <p className="text-gray-500 text-sm">Nenhum pedido ainda.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
