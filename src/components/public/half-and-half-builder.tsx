'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Minus, Plus, ShoppingBag, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { Product, Restaurant, Category } from '@/types'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface HalfAndHalfBuilderProps {
    category: Category
    products: (Product & { product_option_groups: any[] })[]
    restaurant: Restaurant
    primaryColor: string
    textColor: string
}

export default function HalfAndHalfBuilder({
    category,
    products,
    restaurant,
    primaryColor,
    textColor
}: HalfAndHalfBuilderProps) {
    const router = useRouter()
    const addToCart = useCartStore((state) => state.addItem)

    const [quantity, setQuantity] = useState(1)
    const [step, setStep] = useState<'select_first' | 'select_second' | 'config_options' | 'review'>('select_first')

    const [firstProduct, setFirstProduct] = useState<(Product & { product_option_groups: any[] }) | null>(null)
    const [secondProduct, setSecondProduct] = useState<(Product & { product_option_groups: any[] }) | null>(null)

    // Single set of selections for shared options
    const [selections, setSelections] = useState<Record<string, string[]>>({})

    const [observation, setObservation] = useState('')

    // Get merged option groups from both products
    const mergedOptionGroups = useMemo(() => {
        if (!firstProduct || !secondProduct) return []

        // Use first product's option groups as base (assuming same structure for category)
        return firstProduct.product_option_groups || []
    }, [firstProduct, secondProduct])

    // Handle selection toggles
    const handleSelection = (
        groupId: string,
        optionId: string,
        type: 'single' | 'multiple',
        max: number,
        minSelection: number
    ) => {
        setSelections(prev => {
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

    // Calculate price for a product with selections
    const calculatePriceForProduct = (product: Product & { product_option_groups: any[] }) => {
        let price = Number(product.base_price)

        product.product_option_groups.forEach(group => {
            const selectedIds = selections[group.id] || []
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
        if (!firstProduct || !secondProduct) return 0

        const firstHalfPrice = calculatePriceForProduct(firstProduct)
        const secondHalfPrice = calculatePriceForProduct(secondProduct)

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
    }, [firstProduct, secondProduct, selections, quantity, restaurant.half_and_half_pricing_method])

    // Validation for current step
    const canProceed = useMemo(() => {
        if (step === 'select_first') return firstProduct !== null
        if (step === 'select_second') return secondProduct !== null
        if (step === 'config_options') {
            for (const group of mergedOptionGroups) {
                const selectedCount = (selections[group.id] || []).length
                if (group.min_selection > 0 && selectedCount < group.min_selection) {
                    return false
                }
            }
            return true
        }
        return true
    }, [step, firstProduct, secondProduct, selections, mergedOptionGroups])

    const handleNext = () => {
        if (step === 'select_first') setStep('select_second')
        else if (step === 'select_second') setStep('config_options')
        else if (step === 'config_options') setStep('review')
    }

    const handleBack = () => {
        if (step === 'select_second') setStep('select_first')
        else if (step === 'config_options') setStep('select_second')
        else if (step === 'review') setStep('config_options')
    }

    const handleAddToCart = () => {
        if (!firstProduct || !secondProduct) return

        const sharedOptions: any[] = []

        mergedOptionGroups.forEach(group => {
            const selectedIds = selections[group.id] || []
            const selectedOptions = group.product_options?.filter((opt: any) => selectedIds.includes(opt.id)) || []
            selectedOptions.forEach((opt: any) => {
                sharedOptions.push({
                    group_name: group.name,
                    option_name: opt.name,
                    price: Number(opt.price_modifier)
                })
            })
        })

        const firstHalfPrice = calculatePriceForProduct(firstProduct)
        const secondHalfPrice = calculatePriceForProduct(secondProduct)

        // Use first product as the "base" product for the cart item
        addToCart(
            firstProduct,
            quantity,
            [],
            totalPrice,
            restaurant.id,
            {
                first_half: { product: firstProduct, options: sharedOptions, price: firstHalfPrice },
                second_half: { product: secondProduct, options: sharedOptions, price: secondHalfPrice }
            },
            observation
        )

        router.push(`/lp/${restaurant.slug}`)
    }

    const renderOptionGroups = () => {
        return mergedOptionGroups.sort((a, b) => (a.min_selection > 0 ? -1 : 1)).map(group => (
            <div key={group.id} className="space-y-3">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                    <Label className="font-bold text-base">{group.name}</Label>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {group.min_selection > 0 ? 'Obrigatório' : 'Opcional'}
                        {group.max_selection > 1 && ` (Máx: ${group.max_selection})`}
                    </span>
                </div>

                <div className="space-y-2">
                    {group.product_options?.map((option: any) => {
                        const isSelected = (selections[group.id] || []).includes(option.id)
                        return (
                            <div
                                key={option.id}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer transition-all"
                                onClick={() => handleSelection(group.id, option.id, group.type, group.max_selection, group.min_selection)}
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
            {/* Progress Indicator */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">🍕 Montando Meio a Meio</h3>
                    <span className="text-sm text-gray-600">
                        {step === 'select_first' && 'Passo 1 de 3'}
                        {step === 'select_second' && 'Passo 2 de 3'}
                        {step === 'config_options' && 'Passo 3 de 3'}
                        {step === 'review' && 'Revisão'}
                    </span>
                </div>
                <div className="flex gap-1">
                    <div className={cn("h-2 flex-1 rounded-full", step !== 'select_first' ? 'bg-orange-500' : 'bg-orange-200')} />
                    <div className={cn("h-2 flex-1 rounded-full", ['config_options', 'review'].includes(step) ? 'bg-orange-500' : 'bg-orange-200')} />
                    <div className={cn("h-2 flex-1 rounded-full", step === 'review' ? 'bg-orange-500' : 'bg-orange-200')} />
                </div>
            </div>

            {/* Step: Select First Product */}
            {step === 'select_first' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold" style={{ color: textColor }}>Escolha a Primeira Metade</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {products.map(product => (
                            <div
                                key={product.id}
                                onClick={() => setFirstProduct(product)}
                                className={cn(
                                    "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                    firstProduct?.id === product.id
                                        ? "border-orange-500 bg-orange-50"
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold">{product.name}</h4>
                                        {product.description && <p className="text-sm text-gray-600 mt-1">{product.description}</p>}
                                    </div>
                                    <span className="font-bold" style={{ color: primaryColor }}>
                                        R$ {Number(product.base_price).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step: Select Second Product */}
            {step === 'select_second' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold" style={{ color: textColor }}>Escolha a Segunda Metade</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {products.map(product => (
                            <div
                                key={product.id}
                                onClick={() => setSecondProduct(product)}
                                className={cn(
                                    "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                    secondProduct?.id === product.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold">{product.name}</h4>
                                        {product.description && <p className="text-sm text-gray-600 mt-1">{product.description}</p>}
                                    </div>
                                    <span className="font-bold" style={{ color: primaryColor }}>
                                        R$ {Number(product.base_price).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step: Configure Options */}
            {step === 'config_options' && firstProduct && secondProduct && (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-orange-100 to-blue-100 border-2 border-orange-300 p-4 rounded-xl">
                        <h3 className="font-bold text-gray-900 mb-1">Configure as Opções</h3>
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold text-orange-700">1ª metade:</span> {firstProduct.name} •
                            <span className="font-semibold text-blue-700 ml-2">2ª metade:</span> {secondProduct.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            As opções serão aplicadas ao produto inteiro
                        </p>
                    </div>
                    {renderOptionGroups()}
                </div>
            )}

            {/* Step: Review */}
            {step === 'review' && firstProduct && secondProduct && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold" style={{ color: textColor }}>Revise seu Pedido</h3>

                    <div className="bg-gradient-to-r from-orange-50 to-blue-50 border-2 border-orange-300 rounded-xl p-4">
                        <h4 className="font-bold text-gray-900 mb-3">🍕 Meio a Meio</h4>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <p className="text-xs font-semibold text-orange-700 mb-1">1ª Metade</p>
                                <p className="font-bold">{firstProduct.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-blue-700 mb-1">2ª Metade</p>
                                <p className="font-bold">{secondProduct.name}</p>
                            </div>
                        </div>

                        {mergedOptionGroups.some(group => (selections[group.id] || []).length > 0) && (
                            <div className="border-t pt-3">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Opções:</p>
                                <div className="text-sm text-gray-700 space-y-1">
                                    {mergedOptionGroups.map(group => {
                                        const selectedIds = selections[group.id] || []
                                        if (selectedIds.length === 0) return null
                                        const selectedOptions = group.product_options?.filter((opt: any) => selectedIds.includes(opt.id)) || []
                                        return (
                                            <div key={group.id}>
                                                <strong>{group.name}:</strong> {selectedOptions.map((o: any) => o.name).join(', ')}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Observação</Label>
                        <Textarea
                            placeholder="Ex: Tirar cebola, bem passado..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>
            )}

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center gap-4">
                        {step !== 'select_first' && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="h-12"
                            >
                                Voltar
                            </Button>
                        )}

                        {step === 'review' && (
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
                        )}

                        {step !== 'review' ? (
                            <Button
                                className="flex-1 h-12 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all text-white"
                                onClick={handleNext}
                                disabled={!canProceed}
                                style={{ backgroundColor: primaryColor }}
                            >
                                <span className="flex items-center gap-2">
                                    Continuar
                                    <ChevronRight className="w-5 h-5" />
                                </span>
                            </Button>
                        ) : (
                            <Button
                                className="flex-1 h-12 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all flex justify-between px-6 text-white"
                                onClick={handleAddToCart}
                                style={{ backgroundColor: primaryColor }}
                            >
                                <span className="flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    Adicionar
                                </span>
                                <span>R$ {totalPrice.toFixed(2)}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
