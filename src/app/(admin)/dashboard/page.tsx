import { getOwnerRestaurant } from '@/actions/admin'
import { getDashboardStats, getRecentOrders } from '@/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, DollarSign, TruckIcon, Users, Filter, TrendingUp, TrendingDown, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardCharts } from '@/components/admin/DashboardCharts'

export default async function DashboardPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) redirect('/onboarding')

    // Fetch dashboard data
    const [stats, recentOrders] = await Promise.all([
        getDashboardStats(restaurant.id),
        getRecentOrders(restaurant.id, 5)
    ])

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bom dia, {restaurant.name} 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">Aqui está o resumo da sua loja hoje.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${restaurant.is_open ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {restaurant.is_open ? 'Loja Aberta' : 'Loja Fechada'}
                    </span>
                    <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                        <Filter className="w-4 h-4 mr-2" />
                        Hoje
                    </Button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Orders */}
                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Pedidos Hoje</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.totalOrders}</h3>
                            </div>
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <ShoppingBag className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <span className={`flex items-center font-medium px-1.5 py-0.5 rounded ${stats.ordersDelta >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {stats.ordersDelta >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {Math.abs(stats.ordersDelta)}%
                            </span>
                            <span className="text-gray-400 ml-2">vs. ontem</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue */}
                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Faturamento Hoje</p>
                                <h3 className="text-3xl font-bold text-gray-900">R$ {stats.totalRevenue.toFixed(2)}</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <span className={`flex items-center font-medium px-1.5 py-0.5 rounded ${stats.revenueDelta >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {stats.revenueDelta >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {Math.abs(stats.revenueDelta)}%
                            </span>
                            <span className="text-gray-400 ml-2">vs. ontem</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Deliveries */}
                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Entregas Agora</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.activeDeliveries}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <TruckIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <span className="text-amber-600 flex items-center font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                                <Clock className="w-3 h-3 mr-1" />
                                Em andamento
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* New Customers */}
                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Novos Clientes</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.newCustomers}</h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <span className={`flex items-center font-medium px-1.5 py-0.5 rounded ${stats.customersDelta >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {stats.customersDelta >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {Math.abs(stats.customersDelta)}%
                            </span>
                            <span className="text-gray-400 ml-2">vs. ontem</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900">Visão Geral de Vendas</CardTitle>
                        <select className="px-3 py-1 bg-gray-50 border-none rounded-md text-xs text-gray-600 font-medium cursor-pointer hover:bg-gray-100 transition-colors focus:ring-0">
                            <option>Últimos 7 dias</option>
                        </select>
                    </CardHeader>
                    <CardContent>
                        {stats.chartData.length > 0 ? (
                            <DashboardCharts data={stats.chartData} />
                        ) : (
                            <div className="h-[300px] w-full bg-gray-50 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-3">
                                <div className="p-3 bg-white rounded-full shadow-sm">
                                    <DollarSign className="w-6 h-6 text-gray-300" />
                                </div>
                                <span className="text-sm">Sem dados de vendas recentes</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Popular Items / Live Activity */}
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900">Atividade Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                                <div key={order.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className={`w-2 h-2 mt-1.5 rounded-full ${order.status === 'pending' ? 'bg-amber-500' :
                                            order.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'
                                        }`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            Novo pedido #{order.id.slice(0, 6)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • R$ {Number(order.total_amount).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500 py-4 text-center">Nenhuma atividade recente</p>
                            )}
                        </div>
                        <Link href="/dashboard/orders">
                            <Button variant="ghost" className="w-full mt-4 text-xs text-gray-500 hover:text-gray-900">
                                Ver todas as atividades
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders List */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-50 px-6 py-4">
                    <CardTitle className="text-base font-semibold text-gray-900">Pedidos Recentes</CardTitle>
                    <Link href="/dashboard/orders">
                        <Button variant="ghost" size="sm" className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                            Ver todos
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                    </Link>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Horário</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentOrders.length > 0 ? recentOrders.map((order: any) => {
                                const statusColors: Record<string, string> = {
                                    pending: 'bg-amber-100 text-amber-700 border-amber-200',
                                    preparing: 'bg-blue-100 text-blue-700 border-blue-200',
                                    out_for_delivery: 'bg-purple-100 text-purple-700 border-purple-200',
                                    delivered: 'bg-green-100 text-green-700 border-green-200',
                                    canceled: 'bg-red-100 text-red-700 border-red-200',
                                }

                                const statusLabels: Record<string, string> = {
                                    pending: 'Pendente',
                                    preparing: 'Preparando',
                                    out_for_delivery: 'Em Entrega',
                                    delivered: 'Entregue',
                                    canceled: 'Cancelado',
                                }

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-6 text-sm font-mono text-gray-600">#{order.id.slice(0, 6)}</td>
                                        <td className="py-3 px-6 text-sm">
                                            <div className="font-medium text-gray-900">{order.customer?.name || 'Cliente'}</div>
                                            <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-3 px-6">
                                            <Badge
                                                className={`shadow-none font-medium border ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}
                                                variant="secondary"
                                            >
                                                {statusLabels[order.status] || order.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-6 text-sm font-medium text-gray-900">
                                            R$ {Number(order.total_amount).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <Link href={`/dashboard/orders?id=${order.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                                            <p>Nenhum pedido encontrado hoje.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
