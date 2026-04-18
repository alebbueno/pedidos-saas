'use client'

import type { Restaurant } from '@/types'
import { useRestaurantOrderingOpen } from '@/hooks/use-restaurant-ordering-open'

/** Selo Aberto/Fechado alinhado ao horário salvo + pausa manual (`is_open`). */
export function RestaurantOpenStatusPill({ restaurant }: { restaurant: Restaurant }) {
    const status = useRestaurantOrderingOpen(restaurant)
    const open = status.acceptingOrders

    return (
        <div
            className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold sm:min-h-10 sm:px-4 sm:text-sm ${
                open
                    ? 'border-green-200/80 bg-green-50 text-green-800'
                    : 'border-red-200/80 bg-red-50 text-red-800'
            }`}
        >
            <span className={`h-2 w-2 shrink-0 rounded-full ${open ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden />
            {open ? 'Aberto para pedidos' : 'Fechado agora'}
        </div>
    )
}
