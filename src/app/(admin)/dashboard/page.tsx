import { getOwnerRestaurant, getOrders } from '@/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, DollarSign, TruckIcon, Users, Filter } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) redirect('/onboarding')

    const orders = await getOrders(restaurant.id)

    // Calculate stats
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((acc: number, order: any) =>
        acc + (order.status !== 'canceled' ? Number(order.total_amount) : 0), 0
    )
    const activeDeliveries = orders.filter((o: any) =>
        o.status === 'preparing' || o.status === 'out_for_delivery'
    ).length

    // Mock customer count (you can replace with actual data)
    const newCustomers = 720

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <input
                        type="search"
                        placeholder="Search"
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Orders - Dark Burgundy */}
                <Card className="bg-gradient-to-br from-[#4A1C1C] to-[#6B2C2C] text-white border-none overflow-hidden relative">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm text-white/70 mb-1">Total de Pedidos</p>
                                <h3 className="text-4xl font-bold">{totalOrders}</h3>
                            </div>
                        </div>
                        {/* Decorative illustration placeholder */}
                        <div className="absolute bottom-0 right-0 opacity-20">
                            <ShoppingBag className="w-24 h-24" />
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue - Orange */}
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none overflow-hidden relative">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm text-white/80 mb-1">Faturamento</p>
                                <h3 className="text-4xl font-bold">R$ {totalRevenue.toFixed(2)}</h3>
                            </div>
                        </div>
                        {/* Decorative illustration placeholder */}
                        <div className="absolute bottom-0 right-0 opacity-20">
                            <DollarSign className="w-24 h-24" />
                        </div>
                    </CardContent>
                </Card>

                {/* Active Deliveries - Red */}
                <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white border-none overflow-hidden relative">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm text-white/80 mb-1">Entregas Ativas</p>
                                <h3 className="text-4xl font-bold">{activeDeliveries}</h3>
                            </div>
                        </div>
                        {/* Decorative illustration placeholder */}
                        <div className="absolute bottom-0 right-0 opacity-20">
                            <TruckIcon className="w-24 h-24" />
                        </div>
                    </CardContent>
                </Card>

                {/* New Customers - Green */}
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none overflow-hidden relative">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm text-white/80 mb-1">Novos Clientes</p>
                                <h3 className="text-4xl font-bold">{newCustomers}</h3>
                            </div>
                        </div>
                        {/* Decorative illustration placeholder */}
                        <div className="absolute bottom-0 right-0 opacity-20">
                            <Users className="w-24 h-24" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section - Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">Visão Geral de Pedidos e Vendas</CardTitle>
                        <select className="px-3 py-1 border border-gray-200 rounded-md text-sm">
                            <option>Último Mês</option>
                            <option>Últimos 3 Meses</option>
                            <option>Último Ano</option>
                        </select>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                            Chart Placeholder (Add Recharts or similar)
                        </div>
                    </CardContent>
                </Card>

                {/* Live Delivery Tracking - Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Rastreamento de Entregas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                            Map Placeholder
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* List of Orders */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Lista de Pedidos</CardTitle>
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nome do Cliente</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID do Pedido</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Loja</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Horário</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Previsão</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 10).map((order: any) => {
                                    const statusColors: Record<string, string> = {
                                        pending: 'bg-yellow-100 text-yellow-700',
                                        preparing: 'bg-blue-100 text-blue-700',
                                        out_for_delivery: 'bg-purple-100 text-purple-700',
                                        delivered: 'bg-green-100 text-green-700',
                                        canceled: 'bg-red-100 text-red-700',
                                    }

                                    return (
                                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm">{order.customer?.name || 'N/A'}</td>
                                            <td className="py-3 px-4 text-sm font-mono">#{order.id.slice(0, 8)}</td>
                                            <td className="py-3 px-4 text-sm">{restaurant.name}</td>
                                            <td className="py-3 px-4 text-sm">
                                                {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    className={`${statusColors[order.status] || 'bg-gray-100 text-gray-700'} capitalize`}
                                                    variant="secondary"
                                                >
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {order.status === 'delivered' ? '--' : '30 min'}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                            Nenhum pedido encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
