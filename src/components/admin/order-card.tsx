'use client'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateOrderStatus } from '@/actions/admin'
import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Eye } from 'lucide-react'

export default function OrderCard({ order }: { order: any }) {
    const handleStatus = async (status: string) => {
        await updateOrderStatus(order.id, status)
    }

    const OrderDetails = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Cliente</h4>
                    <p className="text-gray-600">{order.customer?.name}</p>
                    <p className="text-gray-600">{order.customer?.phone}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Pagamento</h4>
                    <p className="text-gray-600 bg-gray-100 inline-block px-2 py-1 rounded text-xs uppercase">{order.payment_method}</p>
                </div>
                {order.delivery_type === 'delivery' && (
                    <div className="col-span-2">
                        <h4 className="font-semibold text-gray-900 mb-1">Endereço de envio</h4>
                        <p className="text-gray-600">{order.delivery_address}</p>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Itens do pedido</h4>
                <div className="space-y-3">
                    {order.items?.map((item: any, i: number) => {
                        if (item.half_and_half) {
                            const firstProduct = item.half_and_half.first_half?.product?.name || 'Produto 1'
                            const secondProduct = item.half_and_half.second_half?.product?.name || 'Produto 2'
                            const sharedOptions = item.half_and_half.first_half?.options || item.half_and_half.second_half?.options || []
                            const opts = sharedOptions.length > 0
                                ? sharedOptions.map((o: any) => o.option_name).join(', ')
                                : ''

                            return (
                                <div key={i} className="flex gap-3 bg-gray-50 p-2 rounded-lg">
                                    <div className="font-bold text-gray-900 min-w-[24px]">{item.quantity}x</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">Produto exemplo</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            <div>½ {firstProduct}</div>
                                            <div>½ {secondProduct}</div>
                                        </div>
                                        {opts && <div className="text-xs text-gray-500 mt-1">Opções: {opts}</div>}
                                        {item.observations && <div className="text-xs text-amber-600 italic mt-1">Obs: {item.observations}</div>}
                                    </div>
                                    <div className="font-medium text-gray-900">R$ {item.unit_price.toFixed(2)}</div>
                                </div>
                            )
                        }

                        const opts = item.options_selected && Array.isArray(item.options_selected)
                            ? item.options_selected.map((o: any) => o.option_name).join(', ')
                            : '';

                        return (
                            <div key={i} className="flex gap-3 bg-gray-50 p-2 rounded-lg">
                                <div className="font-bold text-gray-900 min-w-[24px]">{item.quantity}x</div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{item.product?.name}</div>
                                    {opts && <div className="text-xs text-gray-500 mt-1">{opts}</div>}
                                    {item.observations && <div className="text-xs text-amber-600 italic mt-1">Obs: {item.observations}</div>}
                                </div>
                                <div className="font-medium text-gray-900">R$ {item.unit_price.toFixed(2)}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-xl text-green-600">R$ {order.total_amount.toFixed(2)}</span>
            </div>
        </div>
    )

    return (
        <Dialog>
            <Card className="shadow-sm border-none bg-white hover:shadow-md transition-all duration-200 group relative">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                            <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                    </DialogTrigger>
                </div>

                <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Pedido #{order.id.slice(0, 4)}
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {format(new Date(order.created_at), 'HH:mm')}
                            </span>
                        </DialogTitle>

                    </DialogHeader>
                    <OrderDetails />
                </DialogContent>

                <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">#{order.id.slice(0, 4)}</span>
                        <span className="text-xs text-gray-400 font-medium">{format(new Date(order.created_at), 'HH:mm')}</span>
                    </div>
                    <CardTitle className="text-base font-bold text-gray-900 leading-tight">
                        {order.customer?.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1 text-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <span className="uppercase">{order.payment_method}</span>
                        <span className="text-gray-300">•</span>
                        <span className={order.delivery_type === 'delivery' ? 'text-orange-600' : 'text-blue-600'}>
                            {order.delivery_type === 'delivery' ? '🛵 Envio' : '🥡 Retirada'}
                        </span>
                    </div>

                    <div className="border-t border-dashed border-gray-100 pt-3 space-y-2">
                        {order.items?.map((item: any, i: number) => {
                            // Check if it's a half and half item
                            if (item.half_and_half) {
                                const firstProduct = item.half_and_half.first_half?.product?.name || 'Produto 1'
                                const secondProduct = item.half_and_half.second_half?.product?.name || 'Produto 2'

                                return (
                                    <div key={i} className="flex gap-2">
                                        <div className="font-bold text-gray-900 min-w-[20px]">{item.quantity}x</div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800 flex items-center gap-1">
                                                <span>🍕 Meio a Meio ( {firstProduct} / {secondProduct})</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <div key={i} className="flex gap-2">
                                    <div className="font-bold text-gray-900 min-w-[20px]">{item.quantity}x</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">{item.product?.name}</div>
                                    </div>
                                </div>
                            )
                        })}
                        {order.items.length > 3 && (
                            <p className="text-xs text-center text-gray-400 italic">...e mais {order.items.length - 3} itens</p>
                        )}
                    </div>

                    {order.delivery_type === 'delivery' && (
                        <div className="bg-orange-50 p-3 rounded-lg text-xs flex gap-2 text-orange-800 items-start">
                            <span className="mt-0.5">📍</span>
                            <span className="font-medium leading-relaxed line-clamp-2">{order.delivery_address}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400 font-medium">Total</span>
                        <span className="text-lg font-bold text-gray-900">R$ {order.total_amount.toFixed(2)}</span>
                    </div>
                </CardContent>

                <CardFooter className="p-3 bg-gray-50/50 flex justify-end gap-2 border-t border-gray-100">
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50">
                            Ver
                        </Button>
                    </DialogTrigger>

                    {['new', 'pending'].includes(order.status) && (
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-sm text-white" onClick={() => handleStatus('preparing')}>
                            Aceitar
                        </Button>
                    )}
                    {order.status === 'preparing' && (
                        <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 shadow-sm text-white" onClick={() => handleStatus('delivery')}>
                            Enviar
                        </Button>
                    )}
                    {order.status === 'delivery' && (
                        <Button size="sm" variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300" onClick={() => handleStatus('completed')}>
                            Concluir
                        </Button>
                    )}
                    {order.status === 'completed' && (
                        <div className="w-full text-center text-xs font-bold text-green-600 py-2 bg-green-50 rounded">
                            ✓ Concluído
                        </div>
                    )}
                </CardFooter>
            </Card>
        </Dialog>
    )
}
