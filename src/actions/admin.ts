'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getOwnerRestaurant() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    return restaurant
}

export async function getOrders(restaurantId: string) {
    const supabase = await createClient()

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
        *,
        items: order_items (
            *,
            product: products(name)
        ),
        customer: customers(name, phone, address)
    `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

    if (error) console.error(error)
    return orders || []
}

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient()

    await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

    revalidatePath('/dashboard/orders')
}
