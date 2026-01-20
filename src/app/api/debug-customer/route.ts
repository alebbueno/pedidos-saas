import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const phone = url.searchParams.get('phone')

        if (!phone) {
            return NextResponse.json({ error: 'Phone parameter required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Normalize phone
        const normalizedPhone = phone.replace(/\D/g, '')
        const phoneVariations = [
            normalizedPhone,
            phone,
            normalizedPhone.startsWith('55') ? normalizedPhone : `55${normalizedPhone}`,
            normalizedPhone.startsWith('55') ? normalizedPhone.slice(2) : normalizedPhone,
        ].filter((v, i, arr) => arr.indexOf(v) === i)

        const results: any = {
            search_phone: phone,
            normalized_phone: normalizedPhone,
            variations: phoneVariations,
            customers_found: [],
            all_customers_sample: [],
        }

        // Try each variation
        for (const phoneVar of phoneVariations) {
            const { data, error } = await supabase
                .from('customers')
                .select('id, phone, name, email, created_at')
                .eq('phone', phoneVar)
                .maybeSingle()

            if (data) {
                results.customers_found.push({
                    variation: phoneVar,
                    customer: data,
                })
            }

            if (error && error.code !== 'PGRST116') {
                results.customers_found.push({
                    variation: phoneVar,
                    error: error.message,
                })
            }
        }

        // Get sample of all customers to see format
        const { data: sampleCustomers } = await supabase
            .from('customers')
            .select('id, phone, name')
            .limit(20)
            .order('created_at', { ascending: false })

        results.all_customers_sample = sampleCustomers || []

        return NextResponse.json(results)
    } catch (error: any) {
        console.error('Debug customer error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
