'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { Product, Restaurant } from '@/types'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProductOptionsFormProps {
    product: Product & { product_option_groups: any[] }
    restaurant: Restaurant
    primaryColor: string
    textColor: string
}

export default function ProductOptionsForm({
    product,
    restaurant,
    primaryColor,
    textColor
}: ProductOptionsFormProps) {
    const router = useRouter()
    const addToCart = useCartStore((state) => state.addItem)

    const [quantity, setQuantity] = useState(1)
    const [isHalfAndHalf, setIsHalfAndHalf] = useState(false)

    // Normal mode selections
    const [selections, setSelections] = useState<Record<string, string[]>>({})

    // Half and half mode selections
    const [firstHalfSelections, setFirstHalfSelections] = useState<Record<string, string[]>>({})
    const [secondHalfSelections, setSecondHalfSelections] = useState<Record<string, string[]>>({})

    const [observation, setObservation] = useState('')

    // Handle selection toggles
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
            for (const group of product.product_option_groups) {
                const selectedCount = (selections[group.id] || []).length
                if (group.min_selection > 0 && selectedCount < group.min_selection) {
                    return false
                }
            }
            return true
        } else {
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

            addToCart(product, quantity, flatOptions, totalPrice, restaurant.id)
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
                [],
                totalPrice,
                restaurant.id,
                {
                    first_half: { options: firstHalfOptions, price: firstHalfPrice },
                    second_half: { options: secondHalfOptions, price: secondHalfPrice }
                },
                observation
            )
        }

        router.push(`/lp/${restaurant.slug}`)
    }

    const renderOptionGroups = (sels: Record<string, string[]>, half?: 'first' | 'second') => {
        return product.product_option_groups.sort((a, b) => (a.min_selection > 0 ? -1 : 1)).map(group => (
            <div key={group.id} className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                    <Label className="font-bold text-base">{group.name}</Label>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
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
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer transition-all"
                                onClick={() => {
                                    const isSelected = (sels[group.id] || []).includes(option.id)
                                    const selectedCount = (sels[group.id] || []).length
                                    const isMaxReached = group.max_selection && selectedCount >= group.max_selection && !isSelected

                                    if (group.type === 'single' || !isMaxReached) {
                                        handleSelection(group.id, option.id, group.type, group.max_selection, group.min_selection, half)
                                    }
                                }}
                            >
                                <div className="flex items-center space-x-3">
                                    {group.type === 'single' ? (
                                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", isSelected ? "border-primary bg-primary" : "border-gray-300")}>
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                        </div>
                                    ) : (
                                        <Checkbox checked={isSelected} />
                                    )}
                                    <span className="text-sm font-medium">{option.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-600">
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
        <div className="space-y-6 pb-32">
            {/* Half and Half Toggle */}
            {product.allows_half_and_half && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 animate-in slide-in-from-bottom-4 duration-300">
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
            {!isHalfAndHalf ? (
                // Normal mode
                <div className="space-y-6">
                    {renderOptionGroups(selections)}
                </div>
            ) : (
                // Half and half mode
                <div className="space-y-6">
                    <div className="border-2 border-orange-300 rounded-xl p-4 bg-orange-50/30">
                        <h3 className="font-bold text-lg mb-4 text-orange-700">Primeira Metade</h3>
                        <div className="space-y-4">
                            {renderOptionGroups(firstHalfSelections, 'first')}
                        </div>
                    </div>
                    <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50/30">
                        <h3 className="font-bold text-lg mb-4 text-blue-700">Segunda Metade</h3>
                        <div className="space-y-4">
                            {renderOptionGroups(secondHalfSelections, 'second')}
                        </div>
                    </div>
                </div>
            )}

            {/* Observation */}
            <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500">
                <Label>Observação</Label>
                <Textarea
                    placeholder="Ex: Tirar cebola, bem passado..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="resize-none"
                    rows={3}
                />
            </div>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center gap-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden h-12 bg-gray-50 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-full w-12 rounded-none hover:bg-gray-200 text-gray-600"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-10 text-center font-bold text-lg text-gray-900">{quantity}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-full w-12 rounded-none hover:bg-gray-200 text-gray-600"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            className="flex-1 h-12 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all flex justify-between px-6 text-white"
                            onClick={handleAddToCart}
                            disabled={!isValid}
                            style={{ backgroundColor: primaryColor }}
                        >
                            <span className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Adicionar
                            </span>
                            <span>R$ {totalPrice.toFixed(2)}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
