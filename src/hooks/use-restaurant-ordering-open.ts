'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Restaurant } from '@/types'
import { getRestaurantOrderingStatus, type RestaurantOrderingStatus } from '@/lib/opening-hours'

type RestaurantHoursSlice = Pick<Restaurant, 'opening_hours' | 'is_open'>

/** Reavalia a cada minuto. Usa `opening_hours` + `is_open` (pausa manual no painel). */
export function useRestaurantOrderingOpen(
    restaurant: RestaurantHoursSlice
): RestaurantOrderingStatus {
    const [tick, setTick] = useState(0)

    useEffect(() => {
        const id = window.setInterval(() => setTick((n) => n + 1), 60_000)
        return () => window.clearInterval(id)
    }, [])

    return useMemo(
        () =>
            getRestaurantOrderingStatus(
                restaurant.opening_hours,
                new Date(),
                restaurant.is_open
            ),
        [restaurant.opening_hours, restaurant.is_open, tick]
    )
}
