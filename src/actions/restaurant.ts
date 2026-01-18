'use server'

import { createClient } from '@/lib/supabase/server'
import { Restaurant, Category, Product } from '@/types'

export async function getRestaurantBySlug(slug: string) {
    const supabase = await createClient()

    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching restaurant:', error)
        return null
    }

    return restaurant as Restaurant
}

export async function getMenu(restaurantId: string) {
    const supabase = await createClient()

    // Fetch Categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true })

    if (catError) console.error('Error categories:', catError)

    // Fetch Products with Option Groups and Options
    // Note: Supabase query for deep nesting
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select(`
      *,
      product_option_groups (
        *,
        product_options (*)
      )
    `)
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)

    if (prodError) console.error('Error products:', prodError)

    return {
        categories: (categories || []) as Category[],
        products: (products || []) as (Product & { product_option_groups: any[] })[]
    }
}

export async function createOrder(orderData: any) {
    const supabase = await createClient()

    // Use the customerId from orderData (already created in checkout)
    const customerId = orderData.customerId

    if (!customerId) {
        console.error('No customerId provided in orderData')
        return { error: 'Customer ID is required' }
    }

    // Generate IDs and Timestamp server-side to avoid needing SELECT permissions
    const orderId = crypto.randomUUID()
    const now = new Date().toISOString()

    const newOrder: any = {
        id: orderId,
        restaurant_id: orderData.restaurantId,
        customer_id: customerId,
        total_amount: orderData.total,
        delivery_type: orderData.deliveryType,
        delivery_address: orderData.address,
        payment_method: orderData.paymentMethod,
        status: 'new',
        created_at: now,
        updated_at: now
    }

    // Create Order
    // Note: We do NOT use .select() here because the public RLS policy prevents 
    // selecting the order after insertion (even if they just created it).
    // Instead we construct the object manually.
    const { error: orderError } = await supabase
        .from('orders')
        .insert(newOrder)

    if (orderError) {
        console.error('Error creating order', orderError)
        return { error: 'Failed to create order' }
    }

    // 3. Create Order Items
    const items = orderData.items.map((item: any) => {
        const orderItem: any = {
            order_id: orderId,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.base_price,
            total_price: item.totalPrice,
            options_selected: item.selectedOptions
        }

        // Add half_and_half data if present
        if (item.half_and_half) {
            orderItem.half_and_half = item.half_and_half
            console.log('🍕 HALF AND HALF ITEM:', JSON.stringify(orderItem.half_and_half, null, 2))
        }

        // Add observations if present
        if (item.observation) {
            orderItem.observations = item.observation
        }

        return orderItem
    })

    console.log('📦 ORDER ITEMS TO INSERT:', JSON.stringify(items, null, 2))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items)

    if (itemsError) {
        console.error('Error items', itemsError)
        // Note: In a real app we might want to rollback the order here
        return { error: 'Failed to create items' }
    }

    return { success: true, order: newOrder }
}
