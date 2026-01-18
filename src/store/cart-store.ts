import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartState {
    items: CartItem[]
    restaurantId: string | null
    addItem: (
        product: Product,
        quantity: number,
        options: any[],
        totalPrice: number,
        restaurantId: string,
        halfAndHalf?: {
            first_half: { product: Product, options: any[], price: number },
            second_half: { product: Product, options: any[], price: number }
        },
        observation?: string
    ) => void
    removeItem: (itemId: string) => void
    updateQuantity: (itemId: string, newQuantity: number) => void
    clearCart: () => void
    total: () => number
}

// Helper function to check if two items are identical
const areItemsIdentical = (item1: CartItem, item2: { product: Product, selectedOptions: any[], half_and_half?: any }) => {
    // Check if products are the same
    if (item1.product.id !== item2.product.id) return false

    // Check if both are half and half or both are normal
    const item1IsHalf = !!item1.half_and_half
    const item2IsHalf = !!item2.half_and_half

    if (item1IsHalf !== item2IsHalf) return false

    if (item1IsHalf && item2IsHalf) {
        // Compare half and half items - must check products AND options
        const h1First = item1.half_and_half!.first_half
        const h1Second = item1.half_and_half!.second_half
        const h2First = item2.half_and_half!.first_half
        const h2Second = item2.half_and_half!.second_half

        // Check if products are the same
        if (h1First.product.id !== h2First.product.id || h1Second.product.id !== h2Second.product.id) {
            return false
        }

        // Check if options are the same
        if (h1First.options.length !== h2First.options.length || h1Second.options.length !== h2Second.options.length) return false

        const sortedH1First = [...h1First.options].sort((a, b) => `${a.group_name}-${a.option_name}`.localeCompare(`${b.group_name}-${b.option_name}`))
        const sortedH2First = [...h2First.options].sort((a, b) => `${a.group_name}-${a.option_name}`.localeCompare(`${b.group_name}-${b.option_name}`))
        const sortedH1Second = [...h1Second.options].sort((a, b) => `${a.group_name}-${a.option_name}`.localeCompare(`${b.group_name}-${b.option_name}`))
        const sortedH2Second = [...h2Second.options].sort((a, b) => `${a.group_name}-${a.option_name}`.localeCompare(`${b.group_name}-${b.option_name}`))

        const firstMatch = sortedH1First.every((opt, idx) =>
            opt.group_name === sortedH2First[idx].group_name &&
            opt.option_name === sortedH2First[idx].option_name
        )
        const secondMatch = sortedH1Second.every((opt, idx) =>
            opt.group_name === sortedH2Second[idx].group_name &&
            opt.option_name === sortedH2Second[idx].option_name
        )

        return firstMatch && secondMatch
    }

    // Check if options are the same (normal mode)
    const opts1 = item1.selectedOptions || []
    const opts2 = item2.selectedOptions || []

    if (opts1.length !== opts2.length) return false

    // Sort and compare options
    const sorted1 = [...opts1].sort((a, b) =>
        `${a.group_name}-${a.option_name}`.localeCompare(`${b.group_name}-${b.option_name}`)
    )
    const sorted2 = [...opts2].sort((a, b) =>
        `${a.group_name}-${a.option_name}`.localeCompare(`${b.group_name}-${b.option_name}`)
    )

    return sorted1.every((opt, idx) =>
        opt.group_name === sorted2[idx].group_name &&
        opt.option_name === sorted2[idx].option_name
    )
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            restaurantId: null,
            addItem: (product, quantity, options, totalPrice, restaurantId, halfAndHalf, observation) => {
                const currentRestId = get().restaurantId
                // If adding item from different restaurant, clear cart
                if (currentRestId && currentRestId !== restaurantId) {
                    if (!confirm('Você está mudando de restaurante. O carrinho será limpo. Deseja continuar?')) {
                        return
                    }
                    set({ items: [], restaurantId })
                } else {
                    set({ restaurantId })
                }

                // Check if an identical item already exists
                const existingItemIndex = get().items.findIndex(item =>
                    areItemsIdentical(item, { product, selectedOptions: options, half_and_half: halfAndHalf })
                )

                if (existingItemIndex !== -1) {
                    // Item exists, increment quantity
                    set((state) => ({
                        items: state.items.map((item, idx) => {
                            if (idx === existingItemIndex) {
                                const newQuantity = item.quantity + quantity
                                const pricePerUnit = item.totalPrice / item.quantity
                                return {
                                    ...item,
                                    quantity: newQuantity,
                                    totalPrice: pricePerUnit * newQuantity
                                }
                            }
                            return item
                        })
                    }))
                } else {
                    // New item, add to cart
                    const newItem: CartItem = {
                        itemId: Math.random().toString(36).substring(7),
                        product,
                        quantity,
                        selectedOptions: options,
                        totalPrice,
                        half_and_half: halfAndHalf
                    }

                    // Add observation to options if provided
                    if (observation && !halfAndHalf) {
                        newItem.selectedOptions.push({ group_name: 'Observação', option_name: observation, price: 0 })
                    }

                    set((state) => ({
                        items: [...state.items, newItem]
                    }))
                }
            },
            removeItem: (itemId) => set((state) => ({
                items: state.items.filter((i) => i.itemId !== itemId)
            })),
            updateQuantity: (itemId, newQuantity) => set((state) => ({
                items: state.items.map((item) => {
                    if (item.itemId === itemId) {
                        // Recalculate total price based on new quantity
                        const pricePerUnit = item.totalPrice / item.quantity
                        return {
                            ...item,
                            quantity: newQuantity,
                            totalPrice: pricePerUnit * newQuantity
                        }
                    }
                    return item
                })
            })),
            clearCart: () => set({ items: [], restaurantId: null }),
            total: () => {
                return get().items.reduce((acc, item) => acc + item.totalPrice, 0)
            }
        }),
        {
            name: 'pedidos-cart-storage',
        }
    )
)
