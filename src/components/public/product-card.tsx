'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Product, Restaurant } from '@/types'
import Image from 'next/image'
import ProductModal from './product-modal'

interface ProductCardProps {
    product: Product & { product_option_groups: any[] }
    restaurant: Restaurant
}

export default function ProductCard({ product, restaurant }: ProductCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Card
                className="group overflow-hidden rounded-2xl border-none shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
                onClick={() => setIsModalOpen(true)}
            >
                <div className="flex flex-row md:flex-col h-32 md:h-[280px]">
                    {product.image_url ? (
                        <div className="w-1/3 md:w-full relative h-full md:h-48 overflow-hidden">
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:block hidden" />
                        </div>
                    ) : (
                        <div className="w-1/3 md:w-full h-full md:h-48 bg-gray-100 flex items-center justify-center text-gray-300">
                            <span className="text-4xl">🍽️</span>
                        </div>
                    )}

                    <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                        <div className="space-y-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900 text-base md:text-lg line-clamp-2 leading-tight">
                                    {product.name}
                                </h3>
                                <div className="md:hidden">
                                    <span className="font-bold text-primary text-sm bg-primary/10 px-2 py-1 rounded-full">
                                        {Number(product.base_price) > 0 ? `R$ ${Number(product.base_price).toFixed(2)}` : 'R$ --'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 line-clamp-2 font-medium">
                                {product.description}
                            </p>
                        </div>

                        <div className="hidden md:flex justify-between items-center mt-4">
                            <span className="text-lg font-bold text-gray-900">
                                {Number(product.base_price) > 0 ? `R$ ${Number(product.base_price).toFixed(2)}` : 'A partir de...'}
                            </span>
                            <Button size="sm" className="rounded-full px-6 font-bold shadow-md hover:shadow-lg transition-all">
                                Adicionar
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <ProductModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                restaurantId={restaurant.id}
            />
        </>
    )
}
