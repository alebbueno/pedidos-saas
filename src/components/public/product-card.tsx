'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Product, Restaurant, Category } from '@/types'
import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
    product: Product & { product_option_groups: any[] }
    restaurant: Restaurant
    category?: Category
}

export default function ProductCard({ product, restaurant, category }: ProductCardProps) {
    const primaryColor = restaurant.primary_color || '#F97316'
    const textColor = restaurant.text_color || '#000000'

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

    return (
        <Link href={`/lp/${restaurant.slug}/product/${product.id}`}>
            <Card
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white border border-gray-100"
            >
                <div className="flex gap-4 p-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                Sem imagem
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-base mb-1 line-clamp-1" style={{ color: textColor }}>
                                {product.name}
                            </h3>

                            {/* Half and Half Badge */}
                            {category?.allows_half_and_half && (
                                <div className="mb-2">
                                    <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                        🍕 Meio a Meio disponível
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-2">
                            <span
                                className="text-base md:text-lg font-bold"
                                style={{ color: primaryColor }}
                            >
                                {displayPrice > 0
                                    ? `R$ ${displayPrice.toFixed(2)}`
                                    : 'Consultar'}
                            </span>
                            <Button
                                size="sm"
                                className="rounded-full px-4 md:px-6 font-bold shadow-md hover:shadow-lg transition-all text-white"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Adicionar
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
