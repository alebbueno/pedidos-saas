'use client'

import { useEffect, useState } from 'react'
import { useCustomerStore } from '@/store/customer-store'
import { getCustomerOrders } from '@/actions/customer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Package, Clock, CheckCircle, XCircle, MapPin, ArrowLeft, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Restaurant } from '@/types'
import { getRestaurantBySlug } from '@/actions/restaurant'
import { getPaymentMethodLabel } from '@/lib/payment-method-label'

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

    type StatusPresentation = {
        label: string
        hint: string
        icon: typeof Package
        color: string
        bg: string
    }

    const getStatusInfo = (rawStatus: string | null | undefined, deliveryType: string | null | undefined): StatusPresentation => {
        const s = (rawStatus || 'pending').toLowerCase().trim().replace(/-/g, '_')
        const isPickup = deliveryType === 'pickup'

        const map: Record<string, StatusPresentation> = {
            pending: {
                label: 'Pedido recebido',
                hint: 'A loja já recebeu seu pedido e em breve atualiza o próximo passo.',
                icon: Clock,
                color: 'text-blue-700',
                bg: 'bg-blue-100',
            },
            new: {
                label: 'Pedido recebido',
                hint: 'A loja já recebeu seu pedido e em breve atualiza o próximo passo.',
                icon: Clock,
                color: 'text-blue-700',
                bg: 'bg-blue-100',
            },
            confirmed: {
                label: 'Confirmado',
                hint: 'A loja confirmou seu pedido e vai seguir com a preparação.',
                icon: CheckCircle,
                color: 'text-emerald-700',
                bg: 'bg-emerald-100',
            },
            preparing: {
                label: 'Em separação',
                hint: 'Estamos separando ou preparando seus itens com carinho.',
                icon: Package,
                color: 'text-amber-700',
                bg: 'bg-amber-100',
            },
            ready: {
                label: isPickup ? 'Pronto para retirada' : 'Pronto',
                hint: isPickup ? 'Pode ir buscar seu pedido no balcão, conforme combinado com a loja.' : 'Seu pedido está pronto para a próxima etapa.',
                icon: CheckCircle,
                color: 'text-teal-700',
                bg: 'bg-teal-100',
            },
            delivery: {
                label: isPickup ? 'Saiu para retirada' : 'A caminho',
                hint: isPickup
                    ? 'A loja marcou que seu pedido seguiu para retirada ou está liberado.'
                    : 'Seu pedido está a caminho do endereço informado.',
                icon: Truck,
                color: 'text-orange-700',
                bg: 'bg-orange-100',
            },
            out_for_delivery: {
                label: isPickup ? 'Saiu para retirada' : 'A caminho',
                hint: isPickup
                    ? 'A loja marcou que seu pedido seguiu para retirada ou está liberado.'
                    : 'Seu pedido está a caminho do endereço informado.',
                icon: Truck,
                color: 'text-orange-700',
                bg: 'bg-orange-100',
            },
            completed: {
                label: 'Concluído',
                hint: 'Pedido finalizado. Obrigado pela preferência!',
                icon: CheckCircle,
                color: 'text-green-700',
                bg: 'bg-green-100',
            },
            delivered: {
                label: 'Concluído',
                hint: 'Pedido finalizado. Obrigado pela preferência!',
                icon: CheckCircle,
                color: 'text-green-700',
                bg: 'bg-green-100',
            },
            canceled: {
                label: 'Cancelado',
                hint: 'Este pedido foi cancelado. Em caso de dúvida, fale com a loja.',
                icon: XCircle,
                color: 'text-red-700',
                bg: 'bg-red-100',
            },
            cancelled: {
                label: 'Cancelado',
                hint: 'Este pedido foi cancelado. Em caso de dúvida, fale com a loja.',
                icon: XCircle,
                color: 'text-red-700',
                bg: 'bg-red-100',
            },
        }

        return (
            map[s] ?? {
                label: 'Em andamento',
                hint: 'Estamos processando seu pedido. Volte em instantes para ver a atualização.',
                icon: Package,
                color: 'text-gray-700',
                bg: 'bg-gray-100',
            }
        )
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-stone-50 to-stone-100">
            {/* Header Section */}
            <div className="bg-white border-b shadow-sm">
                <div className="container mx-auto max-w-4xl px-3 sm:px-4 py-6 sm:py-8">
                    <Button
                        variant="ghost"
                        className="mb-4 sm:mb-6 min-h-11 -ml-1 px-2 hover:bg-stone-100/80 text-stone-600 rounded-xl touch-manipulation"
                        onClick={() => router.push(`/lp/${restaurant.slug}`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar à loja
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
            <div className="container mx-auto max-w-4xl px-3 sm:px-4 py-6 sm:py-8">
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
                                Ver loja
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const statusInfo = getStatusInfo(order.status, order.delivery_type)
                            const StatusIcon = statusInfo.icon

                            return (
                                <Card
                                    key={order.id}
                                    className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-stone-200/80 border-l-4"
                                    style={{ borderLeftColor: primaryColor }}
                                >
                                    <CardHeader className="space-y-4 pb-4 pt-5 sm:pb-3 sm:pt-6">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                                            <div className="flex min-w-0 flex-1 gap-3">
                                                <div
                                                    className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center"
                                                    style={{ backgroundColor: `${primaryColor}15` }}
                                                >
                                                    <Package className="h-6 w-6" style={{ color: primaryColor }} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <CardTitle className="text-base font-bold leading-snug sm:text-lg">
                                                        Pedido #{order.id.slice(0, 8).toUpperCase()}
                                                    </CardTitle>
                                                    <p className="mt-1 text-sm text-stone-500 leading-relaxed">
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
                                            <div className="min-w-0 w-full border-t border-stone-100 pt-3 sm:w-auto sm:max-w-xs sm:border-t-0 sm:pt-0 sm:shrink-0">
                                                <div
                                                    className={`flex w-full max-w-full flex-wrap items-center gap-2 rounded-full px-3 py-2 sm:w-fit sm:max-w-none ${statusInfo.bg}`}
                                                >
                                                    <StatusIcon className={`h-4 w-4 shrink-0 ${statusInfo.color}`} />
                                                    <span
                                                        className={`min-w-0 flex-1 text-sm font-bold leading-snug text-pretty break-words sm:flex-none ${statusInfo.color}`}
                                                    >
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-left text-sm leading-relaxed text-stone-600 text-pretty break-words sm:text-right">
                                                    {statusInfo.hint}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Order Details Grid */}
                                        <div className="grid grid-cols-1 gap-3 rounded-xl bg-stone-50 p-4 min-[380px]:grid-cols-2 min-[380px]:gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Tipo de Entrega</p>
                                                <p className="font-semibold text-gray-900">
                                                    {order.delivery_type === 'delivery' ? '🚚 Entrega' : '🏪 Retirada'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Pagamento</p>
                                                <p className="font-semibold text-gray-900">
                                                    {getPaymentMethodLabel(order.payment_method)}
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
