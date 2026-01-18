import { getRestaurantBySlug } from '@/actions/restaurant'
import CheckoutForm from '@/components/public/checkout-form'
import CustomerNavbar from '@/components/public/customer-navbar'
import { notFound } from 'next/navigation'

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const restaurant = await getRestaurantBySlug(slug)

    if (!restaurant) return notFound()

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <CustomerNavbar restaurant={restaurant} />

            <div className="bg-white border-b py-4 shadow-sm mb-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-xl font-bold">Finalizar Pedido - {restaurant.name}</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <CheckoutForm restaurant={restaurant} />
            </div>
        </div>
    )
}
