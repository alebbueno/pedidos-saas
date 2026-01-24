import { getOwnerRestaurant } from '@/actions/admin'
import { redirect } from 'next/navigation'
import SettingsClient from './settings-client'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) redirect('/onboarding')

    // Fetch stats
    const supabase = await createClient()

    // Count active products
    const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)

    // Count categories
    const { count: categoriesCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)

    // Count today's orders
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', today.toISOString())

    const stats = {
        products: productsCount || 0,
        categories: categoriesCount || 0,
        todayOrders: todayOrdersCount || 0
    }

    return <SettingsClient restaurant={restaurant} stats={stats} />
}
