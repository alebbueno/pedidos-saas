'use client'

import { useCartStore } from '@/store/cart-store'
import { Restaurant } from '@/types'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { createOrder } from '@/actions/restaurant'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
    name: z.string().min(2, 'Nome é obrigatório'),
    phone: z.string().min(10, 'WhatsApp é obrigatório'),
    deliveryType: z.enum(['delivery', 'pickup']),
    address: z.string().optional(),
    paymentMethod: z.enum(['money', 'pix', 'card_machine']),
    changeFor: z.string().optional()
}).refine((data) => {
    if (data.deliveryType === 'delivery' && !data.address) return false
    return true
}, { message: "Endereço é obrigatório para entrega", path: ["address"] })

export default function CheckoutForm({ restaurant }: { restaurant: Restaurant }) {
    const router = useRouter()
    const items = useCartStore((state) => state.items)
    const total = useCartStore((state) => state.total)
    const clearCart = useCartStore((state) => state.clearCart)
    const cartTotal = total()
    const finalTotal = cartTotal + (restaurant.delivery_fee || 0)

    const [mounted, setMounted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => setMounted(true), [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            deliveryType: 'delivery',
            paymentMethod: 'pix'
        }
    })

    const deliveryType = form.watch('deliveryType')

    if (!mounted) return null
    if (items.length === 0) {
        return <div className="text-center py-10">Seu carrinho está vazio.</div>
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)

        try {
            const orderData = {
                restaurantId: restaurant.id,
                total: finalTotal,
                items: items,
                ...values
            }

            const result = await createOrder(orderData)

            if (result.success && result.order) {
                // Construct WhatsApp Message
                const itemsList = items.map(item => {
                    const opts = item.selectedOptions.map(o => `${o.group_name}: ${o.option_name}`).join(', ')
                    return `${item.quantity}x ${item.product.name}\n   ${opts} - R$ ${item.totalPrice.toFixed(2)}`
                }).join('\n')

                const message = `*Novo Pedido #${result.order.id.slice(0, 8)}*
            
*Cliente:* ${values.name}
*Telefone:* ${values.phone}

*Itens:*
${itemsList}

*Subtotal:* R$ ${cartTotal.toFixed(2)}
*Entrega:* R$ ${restaurant.delivery_fee.toFixed(2)}
*TOTAL:* R$ ${finalTotal.toFixed(2)}

*Tipo de Entrega:* ${values.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
${values.deliveryType === 'delivery' ? `*Endereço:* ${values.address}` : ''}

*Pagamento:* ${values.paymentMethod}
`
                const encodedMessage = encodeURIComponent(message)
                const waUrl = `https://wa.me/${restaurant.whatsapp_number}?text=${encodedMessage}`

                clearCart()
                window.location.href = waUrl // Redirect to WhatsApp
            } else {
                alert('Erro ao criar pedido. Tente novamente.')
            }
        } catch (e) {
            console.error(e)
            alert('Erro inesperado.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Seus dados</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input {...form.register('name')} placeholder="Seu nome" />
                            {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>WhatsApp (com DDD)</Label>
                            <Input {...form.register('phone')} placeholder="11999999999" />
                            {form.formState.errors.phone && <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Entrega</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup defaultValue="delivery" onValueChange={(val) => form.setValue('deliveryType', val as any)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="delivery" id="delivery" />
                                <Label htmlFor="delivery">Entrega (Taxa: R$ {restaurant.delivery_fee.toFixed(2)})</Label>
                            </div>
                            {/* Add Pickup if restaurant supports - assuming yes for MVP */}
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pickup" id="pickup" />
                                <Label htmlFor="pickup">Retirada no Local</Label>
                            </div>
                        </RadioGroup>

                        {deliveryType === 'delivery' && (
                            <div className="space-y-2">
                                <Label>Endereço Completo</Label>
                                <Textarea {...form.register('address')} placeholder="Rua, Número, Complemento, Bairro" />
                                {form.formState.errors.address && <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Pagamento</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup defaultValue="pix" onValueChange={(val) => form.setValue('paymentMethod', val as any)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pix" id="pix" />
                                <Label htmlFor="pix">Pix (Chave enviada no WhatsApp)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="card_machine" id="card" />
                                <Label htmlFor="card">Maquininha na Entrega/Retirada</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="money" id="money" />
                                <Label htmlFor="money">Dinheiro</Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            </div>

            <div>
                <Card className="sticky top-4">
                    <CardHeader><CardTitle>Resumo do Pedido</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {items.map(item => (
                            <div key={item.itemId} className="flex justify-between text-sm">
                                <div>
                                    <span className="font-bold">{item.quantity}x {item.product.name}</span>
                                    <div className="text-gray-500 text-xs">
                                        {item.selectedOptions.map(o => o.option_name).join(', ')}
                                    </div>
                                </div>
                                <span>R$ {item.totalPrice.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>R$ {cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Taxa de Entrega</span>
                                <span>R$ {validationDeliveryFee(deliveryType, restaurant.delivery_fee).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>Total</span>
                                <span>R$ {(cartTotal + validationDeliveryFee(deliveryType, restaurant.delivery_fee)).toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Finalizar Pedido no WhatsApp'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

function validationDeliveryFee(type: string, fee: number) {
    return type === 'delivery' ? fee : 0
}
