import { getMenu, getRestaurantBySlug } from '@/actions/restaurant'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProductOptionsForm from '@/components/public/product-options-form'

interface PageProps {
    params: Promise<{ slug: string; productId: string }>
}

export default async function ProductPage({ params }: PageProps) {
    const { slug, productId } = await params
    const restaurant = await getRestaurantBySlug(slug)

    if (!restaurant) {
        return notFound()
    }

    const { products } = await getMenu(restaurant.id)
    const product = products.find(p => p.id === productId)

    if (!product) {
        return notFound()
    }

    const primaryColor = restaurant.primary_color || '#F97316'
    const textColor = restaurant.text_color || '#000000'
    const backgroundColor = restaurant.background_color || '#FFFFFF'

    // Calculate minimum price from options when base_price is 0
    const calculateMinimumPrice = () => {
        let minPrice = Number(product.base_price)

        // If base price is 0, calculate from required options
        if (minPrice === 0 && product.product_option_groups) {
            product.product_option_groups.forEach((group: any) => {
                if (group.min_selection > 0 && group.product_options && group.product_options.length > 0) {
                    // Find the minimum price modifier in this required group
                    const minModifier = Math.min(...group.product_options.map((opt: any) => Number(opt.price_modifier)))
                    minPrice += minModifier
                }
            })
        }

        return minPrice
    }

    const displayPrice = calculateMinimumPrice()

    // Check if product has options that can modify price
    const hasVariablePrice = product.product_option_groups?.some(
        (group: any) => group.product_options?.some((opt: any) => Number(opt.price_modifier) > 0)
    )

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor }}>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href={`/lp/${slug}`}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg truncate" style={{ color: textColor }}>
                        {product.name}
                    </h1>
                </div>
            </div>

            {/* Product Image */}
            {product.image_url && (
                <div className="relative w-full aspect-square max-h-[400px] bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden">
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover animate-in fade-in duration-500"
                        priority
                    />
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
                {/* Product Info */}
                <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: textColor }}>
                        {product.name}
                    </h2>
                    {product.description && (
                        <p className="text-gray-600 text-base leading-relaxed mb-4">
                            {product.description}
                        </p>
                    )}
                    <div className="flex items-center gap-3">
                        {(hasVariablePrice || Number(product.base_price) === 0) && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                A partir de
                            </span>
                        )}
                        <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                            R$ {displayPrice.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Options Form */}
                <ProductOptionsForm
                    product={product}
                    restaurant={restaurant}
                    primaryColor={primaryColor}
                    textColor={textColor}
                />
            </div>
        </div>
    )
}
