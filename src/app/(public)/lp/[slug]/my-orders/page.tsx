'use client'

import { useEffect, useState } from 'react'
import { useCustomerStore } from '@/store/customer-store'
import { getCustomerOrders } from '@/actions/customer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Package, Clock, CheckCircle, XCircle, MapPin, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Restaurant } from '@/types'
import { getRestaurantBySlug } from '@/actions/restaurant'

export default function MyOrdersPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter()
    const customer = useCustomerStore((state) => state.customer)
    const isLoggedIn = useCustomerStore((state) => state.isLoggedIn)

    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

    useEffect(() => {
        const loadData = async () => {
            console.log('[MyOrdersPage] Starting loadData')
            const { slug } = await params
            const rest = await getRestaurantBySlug(slug)
            setRestaurant(rest)

            console.log('[MyOrdersPage] isLoggedIn:', isLoggedIn, 'customer:', customer)

            if (!isLoggedIn || !customer) {
                console.log('[MyOrdersPage] Not logged in, redirecting...')
                router.push(`/lp/${slug}`)
                return
            }

            console.log('[MyOrdersPage] Fetching orders for customer:', customer.id)
            setIsLoading(true)
            const result = await getCustomerOrders(customer.id)
            console.log('[MyOrdersPage] Orders result:', result)

            if (result.success && result.orders) {
                console.log('[MyOrdersPage] Setting orders:', result.orders.length, 'orders')
                setOrders(result.orders)
            } else {
                console.log('[MyOrdersPage] No orders or error')
            }
            setIsLoading(false)
        }

        loadData()
    }, [customer, isLoggedIn, router, params])

    if (!restaurant) return null

    const primaryColor = restaurant.primary_color || '#F97316'

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'new':
                return { label: 'Novo', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' }
            case 'confirmed':
                return { label: 'Confirmado', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' }
            case 'preparing':
                return { label: 'Preparando', icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' }
            case 'ready':
                return { label: 'Pronto', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' }
            case 'delivered':
                return { label: 'Entregue', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' }
            case 'cancelled':
                return { label: 'Cancelado', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' }
            default:
                return { label: status, icon: Package, color: 'text-gray-600', bg: 'bg-gray-100' }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Section */}
            <div className="bg-white border-b shadow-sm">
                <div className="container mx-auto px-4 max-w-4xl py-8">
                    <Button
                        variant="ghost"
                        className="mb-6 pl-0 hover:bg-transparent hover:opacity-70 text-gray-500"
                        onClick={() => router.push(`/lp/${restaurant.slug}`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Cardápio
                    </Button>
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColor}20` }}
                        >
                            <Package className="w-6 h-6" style={{ color: primaryColor }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
                            <p className="text-gray-500 text-sm">Acompanhe seus pedidos em tempo real</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl py-8">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: primaryColor }} />
                        <p className="text-gray-500">Carregando seus pedidos...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <Card className="border-2 border-dashed">
                        <CardContent className="py-16 text-center">
                            <div
                                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: `${primaryColor}10` }}
                            >
                                <Package className="w-10 h-10" style={{ color: primaryColor }} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Nenhum pedido ainda</h3>
                            <p className="text-gray-500 mb-6">Faça seu primeiro pedido e comece a acompanhar aqui!</p>
                            <Button
                                onClick={() => router.push(`/lp/${restaurant.slug}`)}
                                size="lg"
                                className="shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Ver Cardápio
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const statusInfo = getStatusInfo(order.status)
                            const StatusIcon = statusInfo.icon

                            return (
                                <Card
                                    key={order.id}
                                    className="hover:shadow-lg transition-all duration-200 border-l-4"
                                    style={{ borderLeftColor: primaryColor }}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: `${primaryColor}15` }}
                                                >
                                                    <Package className="w-6 h-6" style={{ color: primaryColor }} />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg font-bold">
                                                        Pedido #{order.id.slice(0, 8).toUpperCase()}
                                                    </CardTitle>
                                                    <p className="text-sm text-gray-500 mt-0.5">
                                                        {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg} flex-shrink-0`}>
                                                <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                                                <span className={`text-sm font-bold ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Order Details Grid */}
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Tipo de Entrega</p>
                                                <p className="font-semibold text-gray-900">
                                                    {order.delivery_type === 'delivery' ? '🚚 Entrega' : '🏪 Retirada'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Pagamento</p>
                                                <p className="font-semibold text-gray-900">
                                                    {order.payment_method === 'pix' ? '💳 PIX' :
                                                        order.payment_method === 'card_machine' ? '💳 Cartão' : '💵 Dinheiro'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        {order.delivery_address && (
                                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-blue-600 font-semibold mb-0.5">Endereço de Entrega</p>
                                                    <p className="text-sm text-gray-700">{order.delivery_address}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Total */}
                                        <div className="flex items-center justify-between pt-3 border-t-2 border-dashed">
                                            <span className="text-gray-600 font-medium">Total do Pedido</span>
                                            <span className="font-bold text-2xl" style={{ color: primaryColor }}>
                                                R$ {order.total_amount.toFixed(2)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
