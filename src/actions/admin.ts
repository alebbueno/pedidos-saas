'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ProductOptionGroup, ProductOption } from '@/types'

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

// Product Actions

type ProductInput = {
    id?: string
    name: string
    description?: string
    base_price: number
    category_id?: string
    image_url?: string
    restaurant_id: string
    allows_half_and_half?: boolean
    option_groups?: (Partial<ProductOptionGroup> & { options?: Partial<ProductOption>[] })[]
}


export async function upsertProduct(product: ProductInput) {
    const supabase = await createClient()

    // 0. Handle Image Cleanup (if updating)
    if (product.id) {
        const { data: oldProduct } = await supabase
            .from('products')
            .select('image_url')
            .eq('id', product.id)
            .single()

        if (oldProduct?.image_url && oldProduct.image_url !== product.image_url) {
            // Image changed (or removed), delete old one
            await deleteImageFromStorage(supabase, oldProduct.image_url)
        }
    }

    // 1. Upsert Product
    const { data: savedProduct, error: prodError } = await supabase
        .from('products')
        .upsert({
            id: product.id, // if undefined, creates new
            restaurant_id: product.restaurant_id,
            name: product.name,
            description: product.description,
            base_price: product.base_price,
            category_id: product.category_id,
            image_url: product.image_url,
            allows_half_and_half: product.allows_half_and_half || false
        })
        .select()
        .single()

    if (prodError) {
        console.error('Error saving product:', prodError)
        return { error: 'Failed to save product' }
    }

    if (!product.option_groups) {
        revalidatePath('/dashboard/menu')
        return { success: true, product: savedProduct }
    }

    // 2. Handle Option Groups
    // Strategy: Delete all existing groups for this product and recreate them. 
    // This is simpler for MVP than diffing.
    // WARNING: This changes IDs, so be careful if order items reference them. 
    // For MVP, if order items store a snapshot (json), it's fine. If they reference FKs, this breaks history.
    // Let's assume Order Items store snapshots (which they do in cart, but check DB schema?).
    // In `restaurant.ts` createOrder, it inserts into `order_items`. 
    // `order_items` usually links to `product`. It links to `options_selected` (JSON?).
    // `types/index.ts`: options_selected: CartItemOption[]. This looks like JSON structure, not FKs to `product_options`.
    // So "Delete and Recreate" is SAFE for Order History.

    // Delete existing groups (cascade deletes options)
    if (product.id) { // Only if editing
        await supabase.from('product_option_groups').delete().eq('product_id', savedProduct.id)
    }

    // Insert new structure
    for (const group of product.option_groups) {
        const { data: savedGroup, error: groupError } = await supabase
            .from('product_option_groups')
            .insert({
                product_id: savedProduct.id,
                name: group.name,
                type: group.type,
                min_selection: group.min_selection,
                max_selection: group.max_selection,
                price_rule: group.price_rule
            } as any)
            .select()
            .single()

        if (groupError) {
            console.error('Error saving group:', groupError)
            continue
        }

        if (group.options && group.options.length > 0) {
            const optionsToInsert = group.options.map(opt => ({
                group_id: savedGroup.id,
                name: opt.name,
                price_modifier: opt.price_modifier || 0,
                is_available: opt.is_available !== false
            }))

            await supabase.from('product_options').insert(optionsToInsert)
        }
    }

    revalidatePath('/dashboard/menu')
    return { success: true, product: savedProduct }
}

export async function deleteProduct(productId: string) {
    const supabase = await createClient()

    // 1. Get Image URL before deleting
    const { data: product } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', productId)
        .single()

    // 2. Delete Product (DB)
    const { error } = await supabase.from('products').delete().eq('id', productId)

    if (error) {
        console.error('Error deleting product:', error)
        // If DB delete fails, don't delete image
    } else {
        // 3. Delete Image (Storage)
        if (product?.image_url) {
            await deleteImageFromStorage(supabase, product.image_url)
        }
    }

    revalidatePath('/dashboard/menu')
}

// Helper to delete image structure
async function deleteImageFromStorage(supabase: any, imageUrl: string) {
    try {
        // URL format: .../storage/v1/object/public/products/folder/file.ext
        // We need: folder/file.ext
        const bucketName = 'products'
        const parts = imageUrl.split(`/${bucketName}/`)
        if (parts.length === 2) {
            const path = parts[1]
            const { error } = await supabase.storage.from(bucketName).remove([path])
            if (error) console.error('Error removing file from storage:', error)
        }
    } catch (e) {
        console.error('Error processing image deletion:', e)
    }
}

// Category Actions

export async function upsertCategory(restaurantId: string, name: string, id?: string, allowsHalfAndHalf?: boolean) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('categories')
        .upsert({
            id,
            restaurant_id: restaurantId,
            name,
            allows_half_and_half: allowsHalfAndHalf ?? false
        })
        .select()
        .single()

    if (error) {
        console.error('Error upserting category:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/menu')
    return { success: true, category: data }
}

export async function deleteCategory(categoryId: string) {
    const supabase = await createClient()

    // Note: Supabase likely has ON DELETE SET NULL or CASCADE for products.category_id
    // If not, this might fail if products are linked.
    // For MVP, assume we can delete.
    const { error } = await supabase.from('categories').delete().eq('id', categoryId)

    if (error) {
        console.error('Error deleting category:', error)
        return { error: 'Failed to delete category' }
    }

    revalidatePath('/dashboard/menu')
    return { success: true }
}

// Customization actions
export async function updateRestaurantColors(restaurantId: string, colors: {
    primary_color: string
    secondary_color: string
    background_color: string
    text_color: string
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update(colors)
        .eq('id', restaurantId)

    if (error) {
        console.error(error)
        return { error: 'Erro ao atualizar cores' }
    }

    revalidatePath('/dashboard/customization')
    return { success: true }
}

export async function updateRestaurantImages(restaurantId: string, images: {
    logo_url?: string
    banner_url?: string
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update(images)
        .eq('id', restaurantId)

    if (error) {
        console.error(error)
        return { error: 'Erro ao atualizar imagens' }
    }

    revalidatePath('/dashboard/customization')
    return { success: true }
}

export async function updateRestaurantFont(restaurantId: string, fontFamily: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update({ font_family: fontFamily })
        .eq('id', restaurantId)

    if (error) {
        console.error(error)
        return { error: 'Erro ao atualizar fonte' }
    }

    revalidatePath('/dashboard/customization')
    return { success: true }
}

export async function updateHalfAndHalfPricingMethod(restaurantId: string, pricingMethod: 'highest' | 'average' | 'sum') {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update({ half_and_half_pricing_method: pricingMethod })
        .eq('id', restaurantId)

    if (error) {
        console.error(error)
        return { error: 'Erro ao atualizar método de cobrança' }
    }

    revalidatePath('/dashboard/customization')
    revalidatePath('/dashboard/menu')
    return { success: true }
}

export async function updateCategoryOrder(categories: { id: string, display_order: number }[]) {
    const supabase = await createClient()

    // Update each category individually. 
    // In a production environment with many categories, a dedicated RPC or a single query construction would be better,
    // but for a menu with ~20 categories, this is fine and robust.
    for (const cat of categories) {
        const { error } = await supabase
            .from('categories')
            .update({ display_order: cat.display_order })
            .eq('id', cat.id)

        if (error) {
            console.error(`Error updating order for category ${cat.id}:`, error)
        }
    }

    revalidatePath('/dashboard/menu')
    return { success: true }
}

// Customer Actions

export async function getCustomers(restaurantId: string, query?: string) {
    const supabase = await createClient()

    let dbQuery = supabase
        .from('customers')
        .select(`
            *,
            orders:orders(count)
        `)
        .eq('restaurant_id', restaurantId)
        .order('last_order_at', { ascending: false, nullsFirst: false })

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    }

    const { data, error } = await dbQuery

    if (error) {
        console.error('Error fetching customers:', error)
        return []
    }

    // Map to include order count flatten
    return data.map((customer: any) => ({
        ...customer,
        order_count: customer.orders?.[0]?.count || 0
    }))
}

export async function getCustomerDetails(customerId: string) {
    const supabase = await createClient()

    // Fetch customer profile
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

    if (customerError) {
        console.error('Error fetching customer details:', customerError)
        return null
    }

    // Fetch order history
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
            *,
            items:order_items(
                *,
                product:products(name)
            )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

    if (ordersError) {
        console.error('Error fetching customer orders:', ordersError)
    }

    return {
        customer,
        orders: orders || []
    }
}
