'use server'

import { createClient } from '@/lib/supabase/server'

export async function debugOrder(orderId: string) {
    const supabase = await createClient()

    // Get order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

    if (orderError) {
        console.error('Order error:', orderError)
        return { error: orderError.message }
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
            *,
            product:products(*)
        `)
        .eq('order_id', order.id)

    if (itemsError) {
        console.error('Items error:', itemsError)
        return { error: itemsError.message }
    }

    return {
        success: true,
        order,
        items
    }
}
