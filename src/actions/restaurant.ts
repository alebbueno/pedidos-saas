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

    // 1. Get or Create Customer
    const { data: customer, error: custError } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', orderData.phone)
        .eq('restaurant_id', orderData.restaurantId)
        .single()

    let customerId = customer?.id

    if (!customer) {
        const { data: newCustomer, error: newCustError } = await supabase
            .from('customers')
            .insert({
                restaurant_id: orderData.restaurantId,
                name: orderData.name,
                phone: orderData.phone,
                address: orderData.address
            })
            .select()
            .single()

        if (newCustError) {
            console.error('Error creating customer:', newCustError)
            return { error: 'Failed to create customer' }
        }
        customerId = newCustomer.id
    }

    // 2. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            restaurant_id: orderData.restaurantId,
            customer_id: customerId,
            total_amount: orderData.total,
            delivery_type: orderData.deliveryType,
            delivery_address: orderData.address,
            payment_method: orderData.paymentMethod,
            status: 'new'
        })
        .select()
        .single()

    if (orderError) {
        console.error('Error creating order', orderError)
        return { error: 'Failed to create order' }
    }

    // 3. Create Order Items
    const items = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.base_price,
        total_price: item.totalPrice,
        options_selected: item.selectedOptions
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items)

    if (itemsError) {
        console.error('Error items', itemsError)
        return { error: 'Failed to create items' }
    }

    return { success: true, order }
}
