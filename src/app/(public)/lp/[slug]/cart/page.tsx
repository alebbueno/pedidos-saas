'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getRestaurantBySlug } from '@/actions/restaurant'
import { useCartStore } from '@/store/cart-store'
import { Restaurant } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import CustomerNavbar from '@/components/public/customer-navbar'

interface CartPageProps {
    params: Promise<{ slug: string }>
}

export default function CartPage({ params }: CartPageProps) {
    const router = useRouter()
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [slug, setSlug] = useState<string>('')

    const items = useCartStore((state) => state.items)
    const removeItem = useCartStore((state) => state.removeItem)
    const updateQuantity = useCartStore((state) => state.updateQuantity)
    const total = useCartStore((state) => state.total)

    useEffect(() => {
        params.then(async (p) => {
            setSlug(p.slug)
            const rest = await getRestaurantBySlug(p.slug)
            setRestaurant(rest)
        })
    }, [params])

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
        )
    }

    const primaryColor = restaurant.primary_color || '#F97316'
    const textColor = restaurant.text_color || '#000000'
    const backgroundColor = restaurant.background_color || '#FFFFFF'
    const deliveryFee = Number(restaurant.delivery_fee) || 0
    const subtotal = total()
    const totalAmount = subtotal + deliveryFee

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor }}>
            {restaurant && <CustomerNavbar restaurant={restaurant} />}

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href={`/lp/${slug}`}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg" style={{ color: textColor }}>
                        Carrinho
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 container mx-auto px-4 py-6 max-w-2xl pb-32">
                {items.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500">
                        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-16 h-16 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
                            Carrinho vazio
                        </h2>
                        <p className="text-gray-500 mb-6 text-center">
                            Adicione produtos do cardápio para começar seu pedido
                        </p>
                        <Link href={`/lp/${slug}`}>
                            <Button
                                className="rounded-full px-8 font-bold shadow-lg hover:shadow-xl transition-all text-white"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Ver Cardápio
                            </Button>
                        </Link>
                    </div>
                ) : (
                    // Items List
                    <div className="space-y-6">
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <Card
                                    key={item.itemId}
                                    className="p-4 hover:shadow-md transition-all duration-200 animate-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        {item.product.image_url ? (
                                            <div className="w-20 h-20 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                <Image
                                                    src={item.product.image_url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0" />
                                        )}

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            {item.half_and_half ? (
                                                // Half and Half Display
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-bold text-base" style={{ color: textColor }}>
                                                            🍕 Meio a Meio
                                                        </h3>
                                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                                            2 sabores
                                                        </span>
                                                    </div>

                                                    {/* First Half */}
                                                    <div className="bg-orange-50 border-l-2 border-orange-400 pl-3 py-2 mb-2 rounded-r">
                                                        <p className="text-xs font-semibold text-orange-700 mb-1">
                                                            1ª Metade: {item.half_and_half.first_half.product.name}
                                                        </p>
                                                        {item.half_and_half.first_half.options.length > 0 && (
                                                            <div className="space-y-0.5">
                                                                {item.half_and_half.first_half.options.map((opt: any, idx: number) => (
                                                                    <p key={idx} className="text-xs text-gray-600">
                                                                        • {opt.option_name}
                                                                        {opt.price > 0 && ` (+R$ ${opt.price.toFixed(2)})`}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Second Half */}
                                                    <div className="bg-blue-50 border-l-2 border-blue-400 pl-3 py-2 rounded-r">
                                                        <p className="text-xs font-semibold text-blue-700 mb-1">
                                                            2ª Metade: {item.half_and_half.second_half.product.name}
                                                        </p>
                                                        {item.half_and_half.second_half.options.length > 0 && (
                                                            <div className="space-y-0.5">
                                                                {item.half_and_half.second_half.options.map((opt: any, idx: number) => (
                                                                    <p key={idx} className="text-xs text-gray-600">
                                                                        • {opt.option_name}
                                                                        {opt.price > 0 && ` (+R$ ${opt.price.toFixed(2)})`}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                // Normal Product Display
                                                <div>
                                                    <h3 className="font-bold text-base mb-1" style={{ color: textColor }}>
                                                        {item.product.name}
                                                    </h3>

                                                    {/* Selected Options */}
                                                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                        <div className="space-y-1 mb-2">
                                                            {item.selectedOptions.map((opt: any, idx: number) => (
                                                                <p key={idx} className="text-xs text-gray-500">
                                                                    • {opt.group_name}: {opt.option_name}
                                                                    {opt.price > 0 && ` (+R$ ${opt.price.toFixed(2)})`}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Quantity and Price */}
                                            <div className="flex items-center justify-between mt-2">
                                                {/* Quantity Selector - Always show */}
                                                <div className="flex items-center border rounded-lg overflow-hidden h-8">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-full w-8 rounded-none hover:bg-gray-100"
                                                        onClick={() => {
                                                            if (item.quantity > 1) {
                                                                updateQuantity(item.itemId, item.quantity - 1)
                                                            }
                                                        }}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-full w-8 rounded-none hover:bg-gray-100"
                                                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-lg" style={{ color: primaryColor }}>
                                                        R$ {item.totalPrice.toFixed(2)}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        onClick={() => removeItem(item.itemId)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <Card className="p-6 bg-gradient-to-b from-gray-50 to-white">
                            <h3 className="font-bold text-lg mb-4" style={{ color: textColor }}>
                                Resumo do Pedido
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Taxa de entrega</span>
                                    <span className="font-semibold">
                                        {deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2)}` : 'Grátis'}
                                    </span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-lg" style={{ color: textColor }}>Total</span>
                                        <span className="font-bold text-2xl" style={{ color: primaryColor }}>
                                            R$ {totalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Fixed Bottom Button */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 shadow-2xl z-50">
                    <div className="container mx-auto px-4 py-4 max-w-2xl">
                        <Button
                            className="w-full h-14 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-white flex items-center justify-between px-6"
                            style={{ backgroundColor: primaryColor }}
                            onClick={() => router.push(`/lp/${slug}/checkout`)}
                        >
                            <span>Finalizar Pedido</span>
                            <span className="text-lg">R$ {totalAmount.toFixed(2)}</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
