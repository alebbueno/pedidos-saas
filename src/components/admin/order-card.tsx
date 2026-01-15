'use client'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateOrderStatus } from '@/actions/admin'
import { format } from 'date-fns'

export default function OrderCard({ order }: { order: any }) {
    const handleStatus = async (status: string) => {
        await updateOrderStatus(order.id, status)
    }

    return (
        <Card className="shadow-sm border-none bg-white hover:shadow-md transition-shadow duration-200 group">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">#{order.id.slice(0, 4)}</span>
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
                        {order.delivery_type === 'delivery' ? '🛵 Entrega' : '🥡 Retirada'}
                    </span>
                </div>

                <div className="border-t border-dashed border-gray-100 pt-3 space-y-2">
                    {order.items?.map((item: any, i: number) => {
                        const opts = item.options_selected && Array.isArray(item.options_selected)
                            ? item.options_selected.map((o: any) => o.option_name).join(', ')
                            : '';

                        return (
                            <div key={i} className="flex gap-2">
                                <div className="font-bold text-gray-900 min-w-[20px]">{item.quantity}x</div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-800">{item.product?.name}</div>
                                    {opts && <div className="text-xs text-gray-400 leading-snug">{opts}</div>}
                                    {item.observations && (
                                        <div className="text-xs text-amber-600 italic bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                            Obs: {item.observations}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {order.delivery_type === 'delivery' && (
                    <div className="bg-orange-50 p-3 rounded-lg text-xs flex gap-2 text-orange-800 items-start">
                        <span className="mt-0.5">📍</span>
                        <span className="font-medium leading-relaxed">{order.delivery_address}</span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">Total</span>
                    <span className="text-lg font-bold text-gray-900">R$ {order.total_amount.toFixed(2)}</span>
                </div>
            </CardContent>

            <CardFooter className="p-3 bg-gray-50/50 flex justify-end gap-2 border-t border-gray-100">
                {order.status === 'new' && (
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => handleStatus('preparing')}>
                        Aceitar Pedido
                    </Button>
                )}
                {order.status === 'preparing' && (
                    <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 shadow-sm" onClick={() => handleStatus('delivery')}>
                        Enviar para Entrega
                    </Button>
                )}
                {order.status === 'delivery' && (
                    <Button size="sm" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300" onClick={() => handleStatus('completed')}>
                        Concluir Pedido
                    </Button>
                )}
                {order.status === 'completed' && (
                    <div className="w-full text-center text-xs font-bold text-green-600 py-2 bg-green-50 rounded">
                        ✓ Concluído
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
