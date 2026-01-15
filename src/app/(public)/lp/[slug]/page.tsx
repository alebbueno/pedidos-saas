import { getMenu, getRestaurantBySlug } from '@/actions/restaurant'
import RestaurantHeader from '@/components/public/restaurant-header'
import ProductList from '@/components/public/product-list'
import FloatingCart from '@/components/public/floating-cart'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function RestaurantPage({ params }: PageProps) {
    const { slug } = await params
    const restaurant = await getRestaurantBySlug(slug)

    if (!restaurant) {
        return notFound()
    }

    const { categories, products } = await getMenu(restaurant.id)

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <RestaurantHeader restaurant={restaurant} />

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <ProductList
                    categories={categories}
                    products={products}
                    restaurant={restaurant}
                />
            </main>

            <FloatingCart restaurant={restaurant} />
        </div>
    )
}
