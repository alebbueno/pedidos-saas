'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, subDays, format, parseISO } from 'date-fns'

export async function getDashboardStats(restaurantId: string) {
    const supabase = await createClient()
    const today = new Date()
    const yesterday = subDays(today, 1)

    // Date ranges
    const startOfToday = startOfDay(today).toISOString()
    const endOfToday = endOfDay(today).toISOString()
    const startOfYesterday = startOfDay(yesterday).toISOString()
    const endOfYesterday = endOfDay(yesterday).toISOString()
    const startOf7DaysAgo = startOfDay(subDays(today, 6)).toISOString() // 7 days window

    // 1. Fetch Today's Orders
    const { data: todayOrders } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startOfToday)
        .lte('created_at', endOfToday)

    // 2. Fetch Yesterday's Orders (for comparison)
    const { data: yesterdayOrders } = await supabase
        .from('orders')
        .select('id, total_amount, status')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startOfYesterday)
        .lte('created_at', endOfYesterday)

    // 3. Fetch Active Deliveries
    const { count: activeDeliveries } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .in('status', ['preparing', 'out_for_delivery'])

    // 4. Fetch New Customers (created today)
    const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startOfToday)

    const { count: yesterdayCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startOfYesterday)
        .lte('created_at', endOfYesterday)

    // 5. Sales Chart Data (Last 7 Days)
    const { data: last7DaysOrders } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startOf7DaysAgo)
        .neq('status', 'canceled') // exclude canceled for revenue
        .order('created_at')

    // Helper: Calculate Metrics
    const calculateMetrics = (orders: any[]) => {
        const count = orders?.length || 0
        const revenue = orders?.reduce((acc, order) =>
            order.status !== 'canceled' ? acc + Number(order.total_amount) : acc, 0) || 0
        return { count, revenue }
    }

    const todayMetrics = calculateMetrics(todayOrders || [])
    const yesterdayMetrics = calculateMetrics(yesterdayOrders || [])

    // Helper: Calculate Delta %
    const calculateDelta = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
    }

    const ordersDelta = calculateDelta(todayMetrics.count, yesterdayMetrics.count)
    const revenueDelta = calculateDelta(todayMetrics.revenue, yesterdayMetrics.revenue)
    const customersDelta = calculateDelta(newCustomers || 0, yesterdayCustomers || 0)

    // Chart Data Processing
    const chartMap = new Map<string, number>()
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i)
        // Use ISO string yyyy-MM-dd key for robust mapping
        const key = d.toISOString().split('T')[0]
        chartMap.set(key, 0)
    }

    last7DaysOrders?.forEach(order => {
        // Adjust date to local or keep UTC? Assuming DB is UTC. 
        // For simplicity, we stick to UTC based slicing or basic string split if created_at is ISO.
        // Better to use date-fns parseISO to avoid timezone glitches if possible.
        const day = parseISO(order.created_at).toISOString().split('T')[0]

        // Only add if within range (it should be due to query)
        if (chartMap.has(day)) {
            const current = chartMap.get(day) || 0
            chartMap.set(day, current + Number(order.total_amount))
        }
    })

    const chartData = Array.from(chartMap.entries())
        .map(([dateKey, amount]) => {
            // Convert '2023-01-01' to '01/01'
            const [y, m, d] = dateKey.split('-')
            return {
                date: `${d}/${m}`,
                fullDate: dateKey,
                amount
            }
        })
        .sort((a, b) => a.fullDate.localeCompare(b.fullDate))

    return {
        totalOrders: todayMetrics.count,
        ordersDelta,
        totalRevenue: todayMetrics.revenue,
        revenueDelta,
        activeDeliveries: activeDeliveries || 0,
        newCustomers: newCustomers || 0,
        customersDelta,
        chartData
    }
}

export async function getRecentOrders(restaurantId: string, limit: number = 5) {
    const supabase = await createClient()

    const { data } = await supabase
        .from('orders')
        .select(`
            *,
            customer: customers(name, phone)
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(limit)

    return data || []
}
