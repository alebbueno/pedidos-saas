import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartState {
    items: CartItem[]
    restaurantId: string | null
    addItem: (product: Product, quantity: number, options: any[], totalPrice: number, restaurantId: string) => void
    removeItem: (itemId: string) => void
    clearCart: () => void
    total: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            restaurantId: null,
            addItem: (product, quantity, options, totalPrice, restaurantId) => {
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

                const newItem: CartItem = {
                    itemId: Math.random().toString(36).substring(7),
                    product,
                    quantity,
                    selectedOptions: options,
                    totalPrice
                }

                set((state) => ({
                    items: [...state.items, newItem]
                }))
            },
            removeItem: (itemId) => set((state) => ({
                items: state.items.filter((i) => i.itemId !== itemId)
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
