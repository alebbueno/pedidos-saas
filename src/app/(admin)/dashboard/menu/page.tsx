import { getMenu } from '@/actions/restaurant'
import { getOwnerRestaurant } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { MenuManager } from './menu-manager'
import Image from 'next/image'

export default async function MenuPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) return <div>Restaurant not found</div>

    const { categories, products } = await getMenu(restaurant.id)

    return (
        <MenuManager restaurantId={restaurant.id} initialProducts={products} initialCategories={categories} />
    )
}

