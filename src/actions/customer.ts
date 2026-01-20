'use server'

import { createClient } from '@/lib/supabase/server'

export interface Customer {
    id: string
    phone: string
    name: string
    email?: string
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
 * Find existing customer by phone or create a new one
 */
export async function findOrCreateCustomer(phone: string, name: string, email?: string) {
    const supabase = await createClient()

    console.log('[findOrCreateCustomer] Starting with phone:', phone)

    try {
        // First, try to find existing customer using maybeSingle (doesn't throw error if not found)
        console.log('[findOrCreateCustomer] Searching for existing customer...')
        const { data: existing } = await supabase
            .from('customers')
            .select('*')
            .eq('phone', phone)
            .maybeSingle()

        console.log('[findOrCreateCustomer] Search result:', { existing: !!existing })

        if (existing) {
            console.log('[findOrCreateCustomer] Customer exists, updating...', existing.id)
            // Customer exists, update their info
            const { data: updated, error: updateError } = await supabase
                .from('customers')
                .update({
                    name,
                    email: email || existing.email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single()

            if (updateError) {
                console.error('Error updating customer:', updateError)
                return { success: false, error: updateError.message }
            }

            console.log('[findOrCreateCustomer] Customer updated successfully')
            return { success: true, customer: updated as Customer }
        }

        // Customer doesn't exist, create new one
        console.log('[findOrCreateCustomer] Customer not found, creating new...')
        const { data: newCustomer, error: createError } = await supabase
            .from('customers')
            .insert({ phone, name, email })
            .select()
            .single()

        if (createError) {
            console.error('[findOrCreateCustomer] Error creating customer:', createError)
            // If we get a duplicate key error, fetch the existing customer
            if (createError.code === '23505') {
                console.log('[findOrCreateCustomer] Duplicate key error, fetching existing customer...')
                const { data: existingCustomer } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('phone', phone)
                    .single()

                console.log('[findOrCreateCustomer] Fetch result:', { found: !!existingCustomer })
                if (existingCustomer) {
                    console.log('[findOrCreateCustomer] Returning existing customer')
                    return { success: true, customer: existingCustomer as Customer }
                }
            }

            return { success: false, error: createError.message }
        }

        console.log('[findOrCreateCustomer] Customer created successfully')
        return { success: true, customer: newCustomer as Customer }
    } catch (error: any) {
        console.error('Error in findOrCreateCustomer:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get customer by phone
 */
export async function getCustomerByPhone(phone: string) {
    const supabase = await createClient()

    try {
        // Normalize phone number: remove all non-digit characters
        const normalizedPhone = phone.replace(/\D/g, '')
        console.log(`[getCustomerByPhone] Searching for phone: ${phone} (normalized: ${normalizedPhone})`)
        
        // Try multiple phone formats
        const phoneVariations = [
            normalizedPhone, // Original normalized
            phone, // Original as received
            normalizedPhone.startsWith('55') ? normalizedPhone : `55${normalizedPhone}`, // With country code
            normalizedPhone.startsWith('55') ? normalizedPhone.slice(2) : normalizedPhone, // Without country code
        ].filter((v, i, arr) => arr.indexOf(v) === i) // Remove duplicates
        
        console.log(`[getCustomerByPhone] Trying phone variations:`, phoneVariations)
        
        // Try each variation
        for (const phoneVar of phoneVariations) {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('phone', phoneVar)
                .maybeSingle()

            if (error && error.code !== 'PGRST116') {
                console.error(`[getCustomerByPhone] Error searching with phone ${phoneVar}:`, error)
                continue
            }

            if (data) {
                console.log(`[getCustomerByPhone] Found customer with phone variation ${phoneVar}:`, data.id)
                return { success: true, customer: data as Customer }
            }
        }
        
        // If no customer found with any variation
        console.log(`[getCustomerByPhone] No customer found for phone: ${phone} (tried: ${phoneVariations.join(', ')})`)
        return { success: true, customer: null }
    } catch (error: any) {
        console.error('[getCustomerByPhone] Exception:', error)
        return { success: false, error: error.message }
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
