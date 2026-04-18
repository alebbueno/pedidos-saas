'use client'

import { useCartStore } from '@/store/cart-store'
import { Restaurant } from '@/types'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRestaurantOrderingOpen } from '@/hooks/use-restaurant-ordering-open'

export default function FloatingCart({ restaurant }: { restaurant: Restaurant }) {
    const items = useCartStore((state) => state.items)
    const total = useCartStore((state) => state.total)
    const restaurantId = useCartStore((state) => state.restaurantId)
    const cartInfo = { itemCount: items.length, totalValue: total() }

    const primaryColor = restaurant.primary_color || '#F97316'

    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const ordering = useRestaurantOrderingOpen(restaurant)

    if (!mounted || cartInfo.itemCount === 0) return null
    if (restaurantId && restaurantId !== restaurant.id) return null // Don't show cart from other restaurant

    if (!ordering.acceptingOrders) {
        return (
            <div
                className="fixed z-50 max-w-2xl mx-auto w-full px-3 sm:px-4 space-y-2"
                style={{
                    bottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
                    left: 'max(0.75rem, env(safe-area-inset-left, 0px))',
                    right: 'max(0.75rem, env(safe-area-inset-right, 0px))',
                }}
            >
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 text-center leading-snug">
                    {ordering.detail}
                </div>
                <Button
                    type="button"
                    disabled
                    className="w-full shadow-lg min-h-14 h-14 flex flex-col justify-center gap-0.5 px-4 motion-safe:animate-in motion-safe:slide-in-from-bottom-4 text-white cursor-not-allowed opacity-80 rounded-2xl touch-manipulation"
                    style={{ backgroundColor: '#94a3b8' }}
                >
                    <span className="font-semibold text-sm">Fora do horário</span>
                    <span className="text-[11px] font-normal opacity-95 line-clamp-2">
                        Compras indisponíveis agora
                    </span>
                </Button>
            </div>
        )
    }

    return (
        <div
            className="fixed z-50 max-w-2xl mx-auto w-full px-3 sm:px-4"
            style={{
                bottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
                left: 'max(0.75rem, env(safe-area-inset-left, 0px))',
                right: 'max(0.75rem, env(safe-area-inset-right, 0px))',
            }}
        >
            <Button
                asChild
                className="w-full shadow-lg min-h-14 h-auto py-3.5 px-0 motion-safe:animate-in motion-safe:slide-in-from-bottom-4 text-white rounded-2xl font-semibold border-0 hover:opacity-95 active:opacity-90"
                style={{ backgroundColor: primaryColor }}
            >
                <Link
                    href={`/lp/${restaurant.slug}/cart`}
                    className="flex w-full items-center justify-between gap-3 px-4 sm:px-6 touch-manipulation rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/90"
                    aria-label={`Abrir carrinho com ${cartInfo.itemCount} itens, total ${cartInfo.totalValue.toFixed(2)} reais`}
                >
                    <span className="flex items-center gap-2 min-w-0">
                        <ShoppingBag className="w-5 h-5 shrink-0" aria-hidden />
                        <span className="truncate text-left text-sm sm:text-base">
                            {cartInfo.itemCount} {cartInfo.itemCount === 1 ? 'item' : 'itens'}
                        </span>
                    </span>
                    <span className="font-bold tabular-nums text-sm sm:text-base shrink-0">
                        Carrinho · R$ {cartInfo.totalValue.toFixed(2)}
                    </span>
                </Link>
            </Button>
        </div>
    )
}
