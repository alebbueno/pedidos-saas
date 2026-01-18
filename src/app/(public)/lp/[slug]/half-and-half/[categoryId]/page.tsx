import { getMenu, getRestaurantBySlug } from '@/actions/restaurant'
import { notFound } from 'next/navigation'
import HalfAndHalfBuilder from '@/components/public/half-and-half-builder'

interface PageProps {
    params: Promise<{ slug: string; categoryId: string }>
}

export default async function HalfAndHalfPage({ params }: PageProps) {
    const { slug, categoryId } = await params
    const restaurant = await getRestaurantBySlug(slug)

    if (!restaurant) {
        return notFound()
    }

    const { categories, products } = await getMenu(restaurant.id)
    const category = categories.find(c => c.id === categoryId)

    if (!category || !category.allows_half_and_half) {
        return notFound()
    }

    // Filter products for this category
    const categoryProducts = products.filter(p => p.category_id === categoryId && p.is_active)

    if (categoryProducts.length < 2) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Meio a Meio Indisponível</h1>
                    <p className="text-gray-600">É necessário ter pelo menos 2 produtos ativos nesta categoria.</p>
                </div>
            </div>
        )
    }

    const primaryColor = restaurant.primary_color || '#F97316'
    const textColor = restaurant.text_color || '#000000'
    const backgroundColor = restaurant.background_color || '#FFFFFF'

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor }}>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <h1 className="font-bold text-lg" style={{ color: textColor }}>
                        Montar Meio a Meio - {category.name}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
                <HalfAndHalfBuilder
                    category={category}
                    products={categoryProducts}
                    restaurant={restaurant}
                    primaryColor={primaryColor}
                    textColor={textColor}
                />
            </div>
        </div>
    )
}
