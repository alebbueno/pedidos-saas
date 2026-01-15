'use client'

import { useCartStore } from '@/store/cart-store'
import { Restaurant } from '@/types'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FloatingCart({ restaurant }: { restaurant: Restaurant }) {
    const items = useCartStore((state) => state.items)
    const total = useCartStore((state) => state.total)
    const restaurantId = useCartStore((state) => state.restaurantId)
    const cartInfo = { itemCount: items.length, totalValue: total() }

    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    if (!mounted || cartInfo.itemCount === 0) return null
    if (restaurantId && restaurantId !== restaurant.id) return null // Don't show cart from other restaurant

    return (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-50">
            <Link href={`/lp/${restaurant.slug}/checkout`}>
                <Button className="w-full shadow-lg h-14 flex justify-between px-6 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        <span>{cartInfo.itemCount} item{cartInfo.itemCount > 1 && 's'}</span>
                    </div>
                    <div className="font-bold">
                        Ver carrinho • R$ {cartInfo.totalValue.toFixed(2)}
                    </div>
                </Button>
            </Link>
        </div>
    )
}
