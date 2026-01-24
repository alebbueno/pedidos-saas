'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Restaurant Settings Actions

export async function updateRestaurantInfo(
    restaurantId: string,
    info: {
        name?: string
        description?: string
        phone?: string
        email?: string
        address?: string
        address_cep?: string
        address_street?: string
        address_number?: string
        address_complement?: string
        address_neighborhood?: string
        address_city?: string
        address_state?: string
    }
) {
    const supabase = await createClient()

    // Map props to database columns
    const dbUpdates: any = { ...info }

    // Map phone to whatsapp_number since that's what we use in onboarding
    if (info.phone) {
        dbUpdates.whatsapp_number = info.phone
        delete dbUpdates.phone
    }

    const { error } = await supabase
        .from('restaurants')
        .update(dbUpdates)
        .eq('id', restaurantId)

    if (error) {
        console.error('[updateRestaurantInfo] Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function updateDeliveryFee(restaurantId: string, deliveryFee: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update({ delivery_fee: deliveryFee })
        .eq('id', restaurantId)

    if (error) {
        console.error('[updateDeliveryFee] Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function updatePaymentMethods(
    restaurantId: string,
    methods: {
        cash?: boolean
        credit?: boolean
        debit?: boolean
        pix?: boolean
        voucher?: boolean
    }
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update({ payment_methods: methods })
        .eq('id', restaurantId)

    if (error) {
        console.error('[updatePaymentMethods] Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function updateOpeningHours(
    restaurantId: string,
    hours: {
        [key: string]: { open: string; close: string; enabled: boolean }
    }
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update({ opening_hours: hours })
        .eq('id', restaurantId)

    if (error) {
        console.error('[updateOpeningHours] Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function updateStoreStatus(restaurantId: string, isOpen: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .update({ is_open: isOpen })
        .eq('id', restaurantId)

    if (error) {
        console.error('[updateStoreStatus] Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/lp/[slug]', 'page') // Revalidate public menu
    return { success: true }
}
