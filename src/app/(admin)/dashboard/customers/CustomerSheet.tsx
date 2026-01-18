'use client'

import { useEffect, useState, useMemo } from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getCustomerDetails } from '@/actions/admin'
import {
    Loader2,
    Phone,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    ShoppingBag,
    TrendingUp,
    DollarSign,
    Package
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CustomerSheetProps {
    customerId: string | null
    onClose: () => void
}

export function CustomerSheet({ customerId, onClose }: CustomerSheetProps) {
    const [data, setData] = useState<{ customer: any, orders: any[] } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (customerId) {
            setLoading(true)
            getCustomerDetails(customerId)
                .then((result) => {
                    setData(result)
                })
                .finally(() => setLoading(false))
        } else {
            setData(null)
        }
    }, [customerId])

    const statusMap: Record<string, { label: string, color: string, bgColor: string, icon: any }> = {
        'new': { label: 'Novo', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: Clock },
        'confirmed': { label: 'Aceito', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', icon: Clock },
        'preparing': { label: 'Preparando', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', icon: Clock },
        'delivery': { label: 'Em entrega', color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200', icon: Clock },
        'completed': { label: 'Concluído', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: CheckCircle },
        'canceled': { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', icon: XCircle },
    }

    // Calculate customer stats
    const stats = useMemo(() => {
        if (!data?.orders.length) return null

        const completedOrders = data.orders.filter(o => o.status === 'completed')
        const totalSpent = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
        const avgOrderValue = completedOrders.length > 0 ? totalSpent / completedOrders.length : 0

        return {
            totalOrders: data.orders.length,
            completedOrders: completedOrders.length,
            totalSpent,
            avgOrderValue
        }
    }, [data])

    return (
        <Sheet open={!!customerId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:w-[700px] overflow-y-auto p-0">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                        <SheetTitle className="sr-only">Carregando detalhes do cliente</SheetTitle>
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                            </div>
                        </div>
                        <p className="text-sm font-medium">Carregando informações...</p>
                    </div>
                ) : data && data.customer ? (
                    <div className="flex flex-col h-full">
                        {/* Header Section with Gradient */}
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
                            <SheetHeader>
                                <SheetTitle className="text-2xl font-bold text-white">{data.customer.name}</SheetTitle>
                                <SheetDescription asChild className="mt-3">
                                    <div className="flex flex-col gap-2.5 text-orange-50">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <span className="font-medium">{data.customer.phone}</span>
                                        </div>
                                        {data.customer.address && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span className="font-medium">{data.customer.address}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>Cliente desde {format(new Date(data.customer.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                        </div>
                                    </div>
                                </SheetDescription>
                            </SheetHeader>
                        </div>

                        {/* Stats Section */}
                        {stats && (
                            <div className="px-6 py-3 bg-white border-b">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex flex-col items-center text-center p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                                            <ShoppingBag className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">{stats.totalOrders}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Pedidos</p>
                                    </div>

                                    <div className="flex flex-col items-center text-center p-3 rounded-lg bg-green-50/50 border border-green-100">
                                        <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">R$ {stats.totalSpent.toFixed(0)}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Total gasto</p>
                                    </div>

                                    <div className="flex flex-col items-center text-center p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                                        <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                                            <TrendingUp className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">R$ {stats.avgOrderValue.toFixed(0)}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Ticket médio</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Orders Section */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <div className="flex items-center gap-2 mb-5">
                                <Package className="h-5 w-5 text-orange-500" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Histórico de Pedidos
                                </h3>
                                <span className="ml-auto text-sm text-gray-500">
                                    {data.orders.length} {data.orders.length === 1 ? 'pedido' : 'pedidos'}
                                </span>
                            </div>

                            {data.orders.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                            <ShoppingBag className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Nenhum pedido realizado ainda</p>
                                        <p className="text-gray-400 text-xs mt-1">Os pedidos aparecerão aqui</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {data.orders.map((order: any) => {
                                        const status = statusMap[order.status] || statusMap['new']
                                        const StatusIcon = status.icon

                                        return (
                                            <Card key={order.id} className={`border transition-all hover:shadow-md ${status.bgColor}`}>
                                                <CardContent className="p-4">
                                                    {/* Order Header */}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.color} ${status.bgColor}`}>
                                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                                    {status.label}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {format(new Date(order.created_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-gray-900">
                                                                R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1 font-medium">
                                                                {order.payment_method === 'card' ? '💳 Cartão' :
                                                                    order.payment_method === 'pix' ? '📱 Pix' : '💵 Dinheiro'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Order Items */}
                                                    {order.items && order.items.length > 0 && (
                                                        <>
                                                            <Separator className="my-3" />
                                                            <div className="space-y-2">
                                                                {order.items.map((item: any) => (
                                                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-white text-xs font-semibold text-gray-700 border">
                                                                                {item.quantity}
                                                                            </span>
                                                                            <span className="text-gray-700 font-medium">
                                                                                {item.product?.name || 'Produto excluído'}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-gray-600 font-semibold">
                                                                            R$ {Number(item.total_price).toFixed(2).replace('.', ',')}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center">
                        <SheetTitle className="sr-only">Cliente não encontrado</SheetTitle>
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <XCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-900 font-semibold">Cliente não encontrado</p>
                        <p className="text-gray-500 text-sm mt-1">Tente novamente mais tarde</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
