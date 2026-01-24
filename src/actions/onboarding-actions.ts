'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Step 1: Create restaurant with basic info
export async function createRestaurantBasicInfo(data: {
    name: string
    slug: string
    whatsapp: string
    description?: string
    // Address fields
    cep: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Usuário não autenticado' }
    }

    // Check if slug is available
    const { data: existing } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', data.slug)
        .single()

    if (existing) {
        return { success: false, error: 'Este link já está em uso. Escolha outro.' }
    }

    // Build full address string
    const fullAddress = [
        data.street,
        data.number,
        data.complement,
        data.neighborhood,
        data.city,
        data.state,
        data.cep
    ].filter(Boolean).join(', ')

    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert({
            name: data.name,
            slug: data.slug,
            whatsapp_number: data.whatsapp,
            address: fullAddress,
            // Detailed address fields
            address_cep: data.cep,
            address_street: data.street,
            address_number: data.number,
            address_complement: data.complement,
            address_neighborhood: data.neighborhood,
            address_city: data.city,
            address_state: data.state,
            description: data.description,
            owner_id: user.id,
            subscription_status: 'trialing',
            onboarding_step: 1
        })
        .select()
        .single()

    if (error) {
        console.error('[createRestaurantBasicInfo] Error:', error)
        return { success: false, error: error.message }
    }

    return { success: true, restaurantId: restaurant.id }
}

// Step 2: Update customization
export async function updateRestaurantCustomization(
    restaurantId: string,
    data: {
        logoUrl?: string
        primaryColor: string
        secondaryColor: string
    }
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update({
            logo_url: data.logoUrl,
            primary_color: data.primaryColor,
            secondary_color: data.secondaryColor,
            onboarding_step: 2
        })
        .eq('id', restaurantId)

    if (error) {
        console.error('[updateRestaurantCustomization] Error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Step 3: Update payment and delivery
export async function updatePaymentAndDelivery(
    restaurantId: string,
    data: {
        paymentMethods: {
            cash: boolean
            pix: boolean
            credit: boolean
            debit: boolean
            voucher: boolean
        }
        deliveryFee: string
        minimumOrderValue: string
    }
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update({
            payment_methods: data.paymentMethods,
            delivery_fee: parseFloat(data.deliveryFee) || 0,
            minimum_order_value: parseFloat(data.minimumOrderValue) || 0,
            onboarding_step: 3
        })
        .eq('id', restaurantId)

    if (error) {
        console.error('[updatePaymentAndDelivery] Error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Step 4: Update business hours
export async function updateBusinessHours(
    restaurantId: string,
    hours: {
        [key: string]: {
            open: string
            close: string
            enabled: boolean
        }
    }
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update({
            opening_hours: hours,
            onboarding_step: 4
        })
        .eq('id', restaurantId)

    if (error) {
        console.error('[updateBusinessHours] Error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Step 5: Create first category
export async function createFirstCategory(
    restaurantId: string,
    data: {
        name: string
        description?: string
    }
) {
    const supabase = await createClient()

    const { data: category, error } = await supabase
        .from('categories')
        .insert({
            restaurant_id: restaurantId,
            name: data.name,
            display_order: 0
        })
        .select()
        .single()

    if (error) {
        console.error('[createFirstCategory] Error:', error)
        return { success: false, error: error.message }
    }

    // Update onboarding step
    await supabase
        .from('restaurants')
        .update({ onboarding_step: 5 })
        .eq('id', restaurantId)

    return { success: true, categoryId: category.id }
}

// Step 6: Create first product
export async function createFirstProduct(
    restaurantId: string,
    categoryId: string,
    data: {
        name: string
        description?: string
        basePrice: string
        imageUrl?: string
    }
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('products')
        .insert({
            restaurant_id: restaurantId,
            category_id: categoryId,
            name: data.name,
            description: data.description,
            base_price: parseFloat(data.basePrice) || 0,
            image_url: data.imageUrl,
            is_active: true
        })

    if (error) {
        console.error('[createFirstProduct] Error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Complete onboarding
export async function completeOnboarding(restaurantId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update({
            onboarding_completed: true,
            onboarding_step: 6
        })
        .eq('id', restaurantId)

    if (error) {
        console.error('[completeOnboarding] Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

// Check if slug is available
export async function checkSlugAvailability(slug: string) {
    const supabase = await createClient()

    const { data } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', slug)
        .single()

    return { available: !data }
}
