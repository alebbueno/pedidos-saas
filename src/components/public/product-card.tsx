'use client'

import { Card } from '@/components/ui/card'
import { Product, Restaurant, Category } from '@/types'
import { canShowHalfAndHalf } from '@/lib/segment-rules'
import { formatProductPriceDisplay, getProductPriceRange, priceRangeHasSpread } from '@/lib/product-price-range'
import Image from 'next/image'
import Link from 'next/link'
import { SplitSquareHorizontal } from 'lucide-react'

interface ProductCardProps {
    product: Product & { product_option_groups: any[] }
    restaurant: Restaurant
    category?: Category
}

export default function ProductCard({ product, restaurant, category }: ProductCardProps) {
    const primaryColor = restaurant.primary_color || '#F97316'
    const textColor = restaurant.text_color || '#000000'

    const priceRange = getProductPriceRange(product)
    const priceLabel = formatProductPriceDisplay(priceRange)
    const showPriceSpread = priceRangeHasSpread(priceRange)

    return (
        <Link
            href={`/lp/${restaurant.slug}/product/${product.id}`}
            className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-400"
        >
            <Card className="overflow-hidden hover:shadow-md active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 transition-[transform,box-shadow] duration-200 cursor-pointer group bg-white border border-stone-200/80 touch-manipulation rounded-2xl">
                <div className="flex gap-3 sm:gap-4 p-3.5 sm:p-4">
                    {/* Product Image */}
                    <div className="relative w-[5.25rem] h-[5.25rem] sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100 ring-1 ring-stone-100">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover md:group-hover:scale-105 transition-transform duration-300 motion-reduce:transition-none"
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
                            <h3
                                className="font-bold text-[0.95rem] sm:text-base mb-1 line-clamp-2 sm:line-clamp-1 leading-snug"
                                style={{ color: textColor }}
                            >
                                {product.name}
                            </h3>

                            {product.is_made_to_order &&
                                product.made_to_order_lead_days != null &&
                                product.made_to_order_lead_days > 0 && (
                                    <div className="mb-2">
                                        <span className="inline-flex items-center text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                                            Encomenda · até {product.made_to_order_lead_days}{' '}
                                            {product.made_to_order_lead_days === 1 ? 'dia' : 'dias'}
                                        </span>
                                    </div>
                                )}

                            {/* Half and Half Badge */}
                            {canShowHalfAndHalf(
                                restaurant.segment,
                                category?.allows_half_and_half,
                                product.allows_half_and_half,
                                product.product_type
                            ) && (
                                <div className="mb-2">
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-800 px-2 py-1 rounded-full font-medium border border-orange-200/80">
                                        <SplitSquareHorizontal className="w-3.5 h-3.5 shrink-0" aria-hidden />
                                        Meio a meio disponível
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-2 flex flex-col gap-2.5 min-[400px]:flex-row min-[400px]:items-end min-[400px]:justify-between min-[400px]:gap-3">
                            <div className="min-w-0 flex-1">
                                {showPriceSpread ? (
                                    <div
                                        className="flex flex-col leading-tight tabular-nums"
                                        style={{ color: primaryColor }}
                                    >
                                        <span className="text-[0.95rem] sm:text-lg font-bold">R$ {priceRange.min.toFixed(2)}</span>
                                        <span className="text-xs sm:text-sm font-bold opacity-90">a R$ {priceRange.max.toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <span
                                        className="text-[0.95rem] sm:text-base md:text-lg font-bold tabular-nums leading-tight"
                                        style={{ color: primaryColor }}
                                    >
                                        {priceLabel}
                                    </span>
                                )}
                            </div>
                            <span
                                className="inline-flex items-center justify-center min-h-11 h-11 shrink-0 self-end min-[400px]:self-auto rounded-full px-4 sm:px-5 text-sm font-bold shadow-sm text-white"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Adicionar
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
