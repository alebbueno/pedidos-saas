'use client'

import { Category, Product, Restaurant } from '@/types'
import ProductCard from '@/components/public/product-card'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ProductListProps {
    categories: Category[]
    products: (Product & { product_option_groups: any[] })[]
    restaurant: Restaurant
}

export default function ProductList({ categories, products, restaurant }: ProductListProps) {
    const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '')

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
            const y = el.getBoundingClientRect().top + window.scrollY - 100 // Offset for header + sticky nav
            window.scrollTo({ top: y, behavior: 'smooth' })
        }
    }

    return (
        <div>
            {/* Sticky Category Nav */}
            <div className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-sm py-4 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-2 border-b border-gray-200/50 mb-6">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => scrollToCategory(cat.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                            activeCategory === cat.id
                                ? "bg-primary text-primary-foreground shadow-md scale-105"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        )}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="space-y-12">
                {categories.map((category) => {
                    const categoryProducts = products.filter(p => p.category_id === category.id)
                    if (categoryProducts.length === 0) return null

                    return (
                        <div key={category.id} id={`category-${category.id}`} className="scroll-mt-32">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                                <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                    {categoryProducts.length} itens
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        restaurant={restaurant}
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
