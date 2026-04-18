'use client'

import { Clock } from 'lucide-react'
import type { Restaurant } from '@/types'
import { useRestaurantOrderingOpen } from '@/hooks/use-restaurant-ordering-open'
import { cn } from '@/lib/utils'

type Props = {
    restaurant: Restaurant
    className?: string
}

/** Aviso quando a loja está fora do horário configurado; não renderiza nada se estiver aberta. */
export function ClosedStoreBanner({ restaurant, className }: Props) {
    const status = useRestaurantOrderingOpen(restaurant)
    if (status.acceptingOrders) return null

    return (
        <div
            role="alert"
            className={cn(
                'rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm',
                className
            )}
        >
            <div className="flex gap-3">
                <Clock className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" aria-hidden />
                <div className="min-w-0 space-y-1">
                    <p className="font-semibold text-sm leading-snug">{status.headline}</p>
                    <p className="text-sm text-amber-900/90 leading-snug">{status.detail}</p>
                </div>
            </div>
        </div>
    )
}
