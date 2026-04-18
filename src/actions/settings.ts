'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BusinessSegment } from '@/types'

const VALID_SEGMENTS: BusinessSegment[] = ['food', 'fashion', 'handcraft', 'retail']

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

/** Altera o segmento do negócio (catálogo, tipos de produto, meio a meio, painel de pedidos). */
export async function updateRestaurantSegment(restaurantId: string, segment: BusinessSegment) {
    if (!VALID_SEGMENTS.includes(segment)) {
        return { success: false as const, error: 'Segmento inválido' }
    }

    const supabase = await createClient()

    const { error } = await supabase.from('restaurants').update({ segment }).eq('id', restaurantId)

    if (error) {
        console.error('[updateRestaurantSegment] Error:', error)
        return { success: false as const, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/menu')
    revalidatePath('/dashboard/customization')
    revalidatePath('/dashboard', 'layout')
    revalidatePath('/lp', 'layout')
    return { success: true as const }
}

export async function updateStoreStatus(restaurantId: string, isOpen: boolean) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { success: false as const, error: 'Não autenticado' }
    }

    const { data: owned, error: ownErr } = await supabase
        .from('restaurants')
        .select('id')
        .eq('id', restaurantId)
        .eq('owner_id', user.id)
        .maybeSingle()

    if (ownErr || !owned) {
        return { success: false as const, error: 'Loja não encontrada' }
    }

    const { error } = await supabase.from('restaurants').update({ is_open: isOpen }).eq('id', restaurantId)

    if (error) {
        console.error('[updateStoreStatus] Error:', error)
        return { success: false as const, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard', 'layout')
    revalidatePath('/dashboard/menu')
    revalidatePath('/lp', 'layout')
    return { success: true as const }
}
