'use client'

import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useCartStore } from '@/store/cart-store'
import { Product, ProductOptionGroup, ProductOption } from '@/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ProductModalProps {
    product: Product & { product_option_groups: (ProductOptionGroup & { options: ProductOption[] })[] }
    isOpen: boolean
    onClose: () => void
    restaurantId: string
}

export default function ProductModal({ product, isOpen, onClose, restaurantId }: ProductModalProps) {
    const addToCart = useCartStore((state) => state.addItem)
    const [quantity, setQuantity] = useState(1)
    const [selections, setSelections] = useState<Record<string, string[]>>({}) // groupId -> optionIds[]
    const [observation, setObservation] = useState('')

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setQuantity(1)
            setSelections({})
            setObservation('')
        }
    }, [isOpen])

    // Helper to handle selection toggles
    const handleSelection = (groupId: string, optionId: string, type: 'single' | 'multiple', max: number) => {
        setSelections(prev => {
            const current = prev[groupId] || []

            if (type === 'single') {
                // If it's single, clicking allows switching, but usually Radio behavior
                return { ...prev, [groupId]: [optionId] }
            } else {
                // Multiple
                if (current.includes(optionId)) {
                    return { ...prev, [groupId]: current.filter(id => id !== optionId) }
                } else {
                    if (max && current.length >= max) return prev // Max reached
                    return { ...prev, [groupId]: [...current, optionId] }
                }
            }
        })
    }

    // Calculate Price
    const totalPrice = useMemo(() => {
        let price = Number(product.base_price)

        product.product_option_groups.forEach(group => {
            const selectedIds = selections[group.id] || []
            if (selectedIds.length === 0) return

            const selectedOptions = group.options?.filter(opt => selectedIds.includes(opt.id)) || []

            if (group.price_rule === 'sum' || !group.price_rule) {
                selectedOptions.forEach(opt => price += Number(opt.price_modifier))
            } else if (group.price_rule === 'highest') {
                const max = Math.max(...selectedOptions.map(o => Number(o.price_modifier)))
                price += max
            } else if (group.price_rule === 'average') {
                const sum = selectedOptions.reduce((acc, curr) => acc + Number(curr.price_modifier), 0)
                price += (sum / selectedOptions.length)
            }
        })

        return price * quantity
    }, [product, selections, quantity])

    // Validation
    const isValid = useMemo(() => {
        // Check required groups
        for (const group of product.product_option_groups) {
            const selectedCount = (selections[group.id] || []).length
            if (group.min_selection > 0 && selectedCount < group.min_selection) {
                return false
            }
        }
        return true
    }, [product, selections])

    const handleAddToCart = () => {
        if (!isValid) return

        // Flatten options for cart
        const flatOptions: any[] = []
        product.product_option_groups.forEach(group => {
            const selectedIds = selections[group.id] || []
            const selectedOptions = group.options?.filter(opt => selectedIds.includes(opt.id)) || []
            selectedOptions.forEach(opt => {
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
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                    <DialogDescription>{product.description}</DialogDescription>
                </DialogHeader>

                {product.image_url && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    </div>
                )}

                {/* Options */}
                <div className="space-y-6">
                    {product.product_option_groups.sort((a, b) => (a.min_selection > 0 ? -1 : 1)).map(group => (
                        <div key={group.id} className="space-y-3">
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <Label className="font-bold text-base">{group.name}</Label>
                                <span className="text-xs text-gray-500">
                                    {group.min_selection > 0 ? 'Obrigatório' : 'Opcional'}
                                    {group.max_selection > 1 && ` (Máx: ${group.max_selection})`}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {group.options?.map(option => {
                                    const isSelected = (selections[group.id] || []).includes(option.id)
                                    return (
                                        <div key={option.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 cursor-pointer"
                                            onClick={() => handleSelection(group.id, option.id, group.type, group.max_selection)}>
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
                    ))}

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

                        <Button className="flex-1 h-12 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all flex justify-between px-6" onClick={handleAddToCart} disabled={!isValid}>
                            <span>Adicionar</span>
                            <span>R$ {totalPrice.toFixed(2)}</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
