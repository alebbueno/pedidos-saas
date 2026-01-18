'use client'

import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useCartStore } from '@/store/cart-store'
import { Product, ProductOptionGroup, ProductOption, Restaurant } from '@/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ProductModalProps {
    product: Product & { product_option_groups: (ProductOptionGroup & { options: ProductOption[] })[] }
    isOpen: boolean
    onClose: () => void
    restaurantId: string
    restaurant: Restaurant
    primaryColor?: string
}

export default function ProductModal({ product, isOpen, onClose, restaurantId, restaurant, primaryColor = '#F97316' }: ProductModalProps) {
    const addToCart = useCartStore((state) => state.addItem)
    const [quantity, setQuantity] = useState(1)
    const [isHalfAndHalf, setIsHalfAndHalf] = useState(false)

    // Normal mode selections
    const [selections, setSelections] = useState<Record<string, string[]>>({})

    // Half and half mode selections
    const [firstHalfSelections, setFirstHalfSelections] = useState<Record<string, string[]>>({})
    const [secondHalfSelections, setSecondHalfSelections] = useState<Record<string, string[]>>({})

    const [observation, setObservation] = useState('')

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setQuantity(1)
            setIsHalfAndHalf(false)
            setSelections({})
            setFirstHalfSelections({})
            setSecondHalfSelections({})
            setObservation('')
        }
    }, [isOpen])

    // Helper to handle selection toggles
    const handleSelection = (
        groupId: string,
        optionId: string,
        type: 'single' | 'multiple',
        max: number,
        minSelection: number,
        half?: 'first' | 'second'
    ) => {
        const setterFn = half === 'first' ? setFirstHalfSelections : half === 'second' ? setSecondHalfSelections : setSelections

        setterFn(prev => {
            const current = prev[groupId] || []

            if (type === 'single') {
                if (current.includes(optionId)) {
                    if (minSelection === 0) {
                        return { ...prev, [groupId]: [] }
                    }
                    return prev
                } else {
                    return { ...prev, [groupId]: [optionId] }
                }
            } else {
                if (current.includes(optionId)) {
                    const newSelection = current.filter(id => id !== optionId)
                    if (newSelection.length >= minSelection) {
                        return { ...prev, [groupId]: newSelection }
                    }
                    return prev
                } else {
                    if (!max || current.length < max) {
                        return { ...prev, [groupId]: [...current, optionId] }
                    }
                    return prev
                }
            }
        })
    }

    // Calculate price for a set of selections
    const calculatePriceForSelections = (sels: Record<string, string[]>) => {
        let price = Number(product.base_price)

        product.product_option_groups.forEach(group => {
            const selectedIds = sels[group.id] || []
            if (selectedIds.length === 0) return

            const selectedOptions = group.product_options?.filter((opt: any) => selectedIds.includes(opt.id)) || []

            if (group.price_rule === 'sum' || !group.price_rule) {
                selectedOptions.forEach((opt: any) => price += Number(opt.price_modifier))
            } else if (group.price_rule === 'highest') {
                const max = Math.max(...selectedOptions.map((o: any) => Number(o.price_modifier)))
                price += max
            } else if (group.price_rule === 'average') {
                const sum = selectedOptions.reduce((acc: number, curr: any) => acc + Number(curr.price_modifier), 0)
                price += (sum / selectedOptions.length)
            }
        })

        return price
    }

    // Calculate Total Price
    const totalPrice = useMemo(() => {
        if (!isHalfAndHalf) {
            return calculatePriceForSelections(selections) * quantity
        } else {
            // Half and half pricing
            const firstHalfPrice = calculatePriceForSelections(firstHalfSelections)
            const secondHalfPrice = calculatePriceForSelections(secondHalfSelections)

            const pricingMethod = restaurant.half_and_half_pricing_method || 'highest'
            let halfAndHalfPrice = 0

            if (pricingMethod === 'highest') {
                halfAndHalfPrice = Math.max(firstHalfPrice, secondHalfPrice)
            } else if (pricingMethod === 'average') {
                halfAndHalfPrice = (firstHalfPrice + secondHalfPrice) / 2
            } else if (pricingMethod === 'sum') {
                halfAndHalfPrice = firstHalfPrice + secondHalfPrice
            }

            return halfAndHalfPrice * quantity
        }
    }, [product, selections, firstHalfSelections, secondHalfSelections, quantity, isHalfAndHalf, restaurant.half_and_half_pricing_method])

    // Validation
    const isValid = useMemo(() => {
        if (!isHalfAndHalf) {
            // Normal mode validation
            for (const group of product.product_option_groups) {
                const selectedCount = (selections[group.id] || []).length
                if (group.min_selection > 0 && selectedCount < group.min_selection) {
                    return false
                }
            }
            return true
        } else {
            // Half and half mode - validate both halves
            for (const group of product.product_option_groups) {
                const firstCount = (firstHalfSelections[group.id] || []).length
                const secondCount = (secondHalfSelections[group.id] || []).length

                if (group.min_selection > 0) {
                    if (firstCount < group.min_selection || secondCount < group.min_selection) {
                        return false
                    }
                }
            }
            return true
        }
    }, [product, selections, firstHalfSelections, secondHalfSelections, isHalfAndHalf])

    const handleAddToCart = () => {
        if (!isValid) return

        if (!isHalfAndHalf) {
            // Normal mode
            const flatOptions: any[] = []
            product.product_option_groups.forEach(group => {
                const selectedIds = selections[group.id] || []
                const selectedOptions = group.product_options?.filter((opt: any) => selectedIds.includes(opt.id)) || []
                selectedOptions.forEach((opt: any) => {
                    flatOptions.push({
                        group_name: group.name,
                        option_name: opt.name,
                        price: Number(opt.price_modifier)
                    })
                })
            })

            if (observation) {
                flatOptions.push({ group_name: 'Observação', option_name: observation, price: 0 })
            }

            addToCart(product, quantity, flatOptions, totalPrice, restaurantId)
        } else {
            // Half and half mode
            const firstHalfOptions: any[] = []
            const secondHalfOptions: any[] = []

            product.product_option_groups.forEach(group => {
                // First half
                const firstIds = firstHalfSelections[group.id] || []
                const firstOpts = group.product_options?.filter((opt: any) => firstIds.includes(opt.id)) || []
                firstOpts.forEach((opt: any) => {
                    firstHalfOptions.push({
                        group_name: group.name,
                        option_name: opt.name,
                        price: Number(opt.price_modifier)
                    })
                })

                // Second half
                const secondIds = secondHalfSelections[group.id] || []
                const secondOpts = group.product_options?.filter((opt: any) => secondIds.includes(opt.id)) || []
                secondOpts.forEach((opt: any) => {
                    secondHalfOptions.push({
                        group_name: group.name,
                        option_name: opt.name,
                        price: Number(opt.price_modifier)
                    })
                })
            })

            const firstHalfPrice = calculatePriceForSelections(firstHalfSelections)
            const secondHalfPrice = calculatePriceForSelections(secondHalfSelections)

            addToCart(
                product,
                quantity,
                [], // Empty for half and half
                totalPrice,
                restaurantId,
                {
                    first_half: { options: firstHalfOptions, price: firstHalfPrice },
                    second_half: { options: secondHalfOptions, price: secondHalfPrice }
                },
                observation
            )
        }

        onClose()
    }

    const renderOptionGroups = (sels: Record<string, string[]>, half?: 'first' | 'second') => {
        return product.product_option_groups.sort((a, b) => (a.min_selection > 0 ? -1 : 1)).map(group => (
            <div key={group.id} className="space-y-3">
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <Label className="font-bold text-base">{group.name}</Label>
                    <span className="text-xs text-gray-500">
                        {group.min_selection > 0 ? 'Obrigatório' : 'Opcional'}
                        {group.max_selection > 1 && ` (Máx: ${group.max_selection})`}
                    </span>
                </div>

                <div className="space-y-2">
                    {group.product_options?.map((option: any) => {
                        const isSelected = (sels[group.id] || []).includes(option.id)
                        return (
                            <div
                                key={option.id}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 cursor-pointer"
                                onClick={() => {
                                    const isSelected = (sels[group.id] || []).includes(option.id)
                                    const selectedCount = (sels[group.id] || []).length
                                    const isMaxReached = group.max_selection && selectedCount >= group.max_selection && !isSelected

                                    if (group.type === 'single' || !isMaxReached) {
                                        handleSelection(group.id, option.id, group.type, group.max_selection, group.min_selection, half)
                                    }
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    {group.type === 'single' ? (
                                        <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", isSelected ? "border-primary bg-primary" : "border-gray-300")}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    ) : (
                                        <Checkbox checked={isSelected} />
                                    )}
                                    <span className="text-sm">{option.name}</span>
                                </div>
                                <span className="text-sm text-gray-600">
                                    {Number(option.price_modifier) > 0 && `+ R$ ${Number(option.price_modifier).toFixed(2)}`}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        ))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                    <DialogDescription>{product.description}</DialogDescription>
                </DialogHeader>

                {product.image_url && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    </div>
                )}

                {/* Half and Half Toggle */}
                {product.allows_half_and_half && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="font-bold text-base">🍕 Meio a Meio</Label>
                                <p className="text-xs text-gray-600 mt-1">Escolha duas metades diferentes</p>
                            </div>
                            <Button
                                variant={isHalfAndHalf ? "default" : "outline"}
                                onClick={() => setIsHalfAndHalf(!isHalfAndHalf)}
                                style={isHalfAndHalf ? { backgroundColor: primaryColor } : {}}
                                className={isHalfAndHalf ? "text-white" : ""}
                            >
                                {isHalfAndHalf ? 'Meio a Meio Ativo' : 'Ativar Meio a Meio'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Options */}
                <div className="space-y-6">
                    {!isHalfAndHalf ? (
                        // Normal mode
                        renderOptionGroups(selections)
                    ) : (
                        // Half and half mode
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50/30">
                                <h3 className="font-bold text-lg mb-4 text-orange-700">Primeira Metade</h3>
                                <div className="space-y-4">
                                    {renderOptionGroups(firstHalfSelections, 'first')}
                                </div>
                            </div>
                            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50/30">
                                <h3 className="font-bold text-lg mb-4 text-blue-700">Segunda Metade</h3>
                                <div className="space-y-4">
                                    {renderOptionGroups(secondHalfSelections, 'second')}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Observação</Label>
                        <Textarea
                            placeholder="Ex: Tirar cebola, bem passado..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="sticky bottom-0 bg-white p-4 border-t mt-4 flex flex-col gap-3 z-10">
                    <div className="flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden h-12 bg-gray-50 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-full w-12 rounded-none hover:bg-gray-200 text-gray-600"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <span className="text-xl font-bold">-</span>
                            </Button>
                            <span className="w-10 text-center font-bold text-lg text-gray-900">{quantity}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-full w-12 rounded-none hover:bg-gray-200 text-gray-600"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <span className="text-xl font-bold">+</span>
                            </Button>
                        </div>

                        <Button
                            className="flex-1 h-12 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all flex justify-between px-6 text-white"
                            onClick={handleAddToCart}
                            disabled={!isValid}
                            style={{ backgroundColor: primaryColor }}
                        >
                            <span>Adicionar</span>
                            <span>R$ {totalPrice.toFixed(2)}</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
