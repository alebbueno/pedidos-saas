'use client'

import { Category, Product, Restaurant } from '@/types'
import { getSegmentRules } from '@/lib/segment-rules'
import ProductCard from '@/components/public/product-card'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Pizza } from 'lucide-react'

interface ProductListProps {
    categories: Category[]
    products: (Product & { product_option_groups: any[] })[]
    restaurant: Restaurant
}

export default function ProductList({ categories, products, restaurant }: ProductListProps) {
    const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '')
    const segmentRules = getSegmentRules(restaurant.segment)

    const primaryColor = restaurant.primary_color || '#F97316'
    const textColor = restaurant.text_color || '#000000'

    useEffect(() => {
        const handleScroll = () => {
            // Logic to update active category based on scroll position could go here
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToCategory = (id: string) => {
        setActiveCategory(id)
        const el = document.getElementById(`category-${id}`)
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 120 // Navbar + faixa de categorias
            window.scrollTo({ top: y, behavior: 'smooth' })
        }
    }

    return (
        <div>
            {/* Categorias: compactas no mobile, sticky só após o hero (z abaixo do header da loja) */}
            <nav
                aria-label="Categorias do cardápio"
                className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 mb-4 flex gap-1.5 overflow-x-auto rounded-xl border border-stone-200/70 bg-white/90 px-1.5 py-1.5 shadow-sm backdrop-blur-md sm:mb-6 sm:gap-2 sm:rounded-2xl sm:px-2 sm:py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {categories.map((cat) => (
                    <button
                        type="button"
                        key={cat.id}
                        onClick={() => scrollToCategory(cat.id)}
                        className={cn(
                            'min-h-10 shrink-0 touch-manipulation rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:min-h-11 sm:px-4 sm:py-2 sm:text-sm',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1',
                            activeCategory === cat.id
                                ? 'text-white shadow-sm'
                                : 'border border-stone-200/80 bg-stone-50 text-stone-700 hover:bg-stone-100 active:bg-stone-200'
                        )}
                        style={activeCategory === cat.id ? { backgroundColor: primaryColor } : {}}
                    >
                        {cat.name}
                    </button>
                ))}
            </nav>

            <div className="space-y-12">
                {categories.map((category) => {
                    const categoryProducts = products.filter(p => p.category_id === category.id)
                    if (categoryProducts.length === 0) return null

                    return (
                        <div key={category.id} id={`category-${category.id}`} className="scroll-mt-36">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5 sm:mb-6">
                                <div className="min-w-0">
                                    <h2
                                        className="text-xl sm:text-2xl font-bold tracking-tight"
                                        style={{ color: textColor }}
                                    >
                                        {category.name}
                                    </h2>
                                    <span className="text-xs sm:text-sm text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full mt-2 inline-block font-medium">
                                        {categoryProducts.length}{' '}
                                        {categoryProducts.length === 1 ? 'item' : 'itens'}
                                    </span>
                                </div>

                                {/* Half and Half Button */}
                                {segmentRules.allowHalfAndHalf && category.allows_half_and_half && categoryProducts.length >= 2 && (
                                    <Link
                                        href={`/lp/${restaurant.slug}/half-and-half/${category.id}`}
                                        className="inline-flex w-full sm:w-auto shrink-0 min-h-11 items-center justify-center gap-2 px-4 rounded-xl font-semibold text-white shadow-md hover:opacity-95 active:opacity-90 transition-opacity touch-manipulation"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Pizza className="w-4 h-4 shrink-0 opacity-95" aria-hidden />
                                        Montar meio a meio
                                    </Link>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                {categoryProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        restaurant={restaurant}
                                        category={category}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
