import { getMenu, getRestaurantBySlug } from '@/actions/restaurant'
import RestaurantHeader from '@/components/public/restaurant-header'
import CustomerNavbar from '@/components/public/customer-navbar'
import ProductList from '@/components/public/product-list'
import FloatingCart from '@/components/public/floating-cart'
import { ClosedStoreBanner } from '@/components/public/closed-store-banner'
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
        <div className="min-h-screen overflow-x-hidden pb-[max(6.5rem,calc(5.5rem+env(safe-area-inset-bottom,0px)))]">
            <CustomerNavbar restaurant={restaurant} />
            <RestaurantHeader restaurant={restaurant} />

            <main className="relative z-0 mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-8">
                <ClosedStoreBanner restaurant={restaurant} className="mb-4 sm:mb-6" />
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
