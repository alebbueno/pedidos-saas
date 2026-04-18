'use server'

import { createClient } from '@/lib/supabase/server'
import { buildPhoneSearchVariations } from '@/lib/phone-variations'

export interface Customer {
    id: string
    phone: string
    name: string
    email?: string
    restaurant_id?: string | null
    created_at: string
    updated_at: string
}

export interface CustomerAddress {
    id: string
    customer_id: string
    address: string
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    reference?: string
    is_default: boolean
    created_at: string
}

/**
 * Busca cliente existente nesta loja ou cria um novo (telefone é único por restaurante).
 */
export async function findOrCreateCustomer(
    phone: string,
    name: string,
    email: string | undefined,
    restaurantId: string
) {
    const supabase = await createClient()

    if (!restaurantId) {
        return { success: false as const, error: 'restaurantId é obrigatório' }
    }

    try {
        const variations = buildPhoneSearchVariations(phone)

        for (const phoneVar of variations) {
            const { data: existing } = await supabase
                .from('customers')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .eq('phone', phoneVar)
                .maybeSingle()

            if (existing) {
                const updates: Record<string, unknown> = {
                    name,
                    email: email || existing.email,
                    updated_at: new Date().toISOString(),
                }

                const { data: updated, error: updateError } = await supabase
                    .from('customers')
                    .update(updates)
                    .eq('id', existing.id)
                    .select()
                    .single()

                if (updateError) {
                    console.error('Error updating customer:', updateError)
                    return { success: false as const, error: updateError.message }
                }

                return { success: true as const, customer: updated as Customer }
            }
        }

        const canonicalPhone = phone.replace(/\D/g, '')
        const newCustomerData = {
            phone: canonicalPhone || phone,
            name,
            email: email || null,
            restaurant_id: restaurantId,
        }

        const { data: newCustomer, error: createError } = await supabase
            .from('customers')
            .insert(newCustomerData)
            .select()
            .single()

        if (createError) {
            console.error('[findOrCreateCustomer] Error creating customer:', createError)
            if (createError.code === '23505') {
                for (const phoneVar of buildPhoneSearchVariations(phone)) {
                    const { data: existingCustomer } = await supabase
                        .from('customers')
                        .select('*')
                        .eq('restaurant_id', restaurantId)
                        .eq('phone', phoneVar)
                        .maybeSingle()
                    if (existingCustomer) {
                        return { success: true as const, customer: existingCustomer as Customer }
                    }
                }
            }

            return { success: false as const, error: createError.message }
        }

        return { success: true as const, customer: newCustomer as Customer }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('Error in findOrCreateCustomer:', error)
        return { success: false as const, error: message }
    }
}

/**
 * Busca cliente pelo telefone apenas na loja informada.
 */
export async function getCustomerByPhone(phone: string, restaurantId: string) {
    const supabase = await createClient()

    if (!restaurantId) {
        return { success: false as const, error: 'restaurantId é obrigatório', customer: null }
    }

    try {
        const phoneVariations = buildPhoneSearchVariations(phone)

        for (const phoneVar of phoneVariations) {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .eq('phone', phoneVar)
                .maybeSingle()

            if (error && error.code !== 'PGRST116') {
                console.error(`[getCustomerByPhone] Error searching with phone ${phoneVar}:`, error)
                continue
            }

            if (data) {
                return { success: true as const, customer: data as Customer }
            }
        }

        return { success: true as const, customer: null }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('[getCustomerByPhone] Exception:', error)
        return { success: false as const, error: message, customer: null }
    }
}

/**
 * Save a new address for a customer
 */
export async function saveCustomerAddress(
    customerId: string,
    street: string,
    number: string,
    neighborhood: string,
    city: string,
    complement?: string,
    reference?: string,
    isDefault: boolean = false
) {
    const supabase = await createClient()

    try {
        // Concatenate full address for display
        let fullAddress = `${street}, ${number}`
        if (complement) fullAddress += `, ${complement}`
        fullAddress += `, ${neighborhood}, ${city}`

        // If setting as default, unset other defaults first
        if (isDefault) {
            await supabase
                .from('customer_addresses')
                .update({ is_default: false })
                .eq('customer_id', customerId)
        }

        const { data, error } = await supabase
            .from('customer_addresses')
            .insert({
                customer_id: customerId,
                address: fullAddress,
                street,
                number,
                neighborhood,
                city,
                complement,
                reference,
                is_default: isDefault
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving address:', error)
            return { success: false, error: error.message }
        }

        return { success: true, address: data as CustomerAddress }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Get all addresses for a customer
 */
export async function getCustomerAddresses(customerId: string) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('customer_addresses')
            .select('*')
            .eq('customer_id', customerId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, addresses: data as CustomerAddress[] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Get customer's order history
 */
export async function getCustomerOrders(customerId: string) {
    const supabase = await createClient()

    console.log('[getCustomerOrders] Fetching orders for customer:', customerId)

    try {
        // Use RPC to bypass RLS for fetching orders
        const { data, error } = await supabase.rpc('get_customer_orders', {
            p_customer_id: customerId
        })

        console.log('[getCustomerOrders] Result:', { data, error, count: data?.length })

        if (error) {
            console.error('[getCustomerOrders] Error:', error)
            return { success: false, error: error.message }
        }

        return { success: true, orders: data }
    } catch (error: any) {
        console.error('[getCustomerOrders] Exception:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Delete a customer address
 */
export async function deleteCustomerAddress(addressId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('customer_addresses')
            .delete()
            .eq('id', addressId)

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
