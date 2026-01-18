import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Customer {
    id: string
    phone: string
    name: string
    email?: string
}

export interface CustomerAddress {
    id: string
    customer_id: string
    address: string
    complement?: string
    reference?: string
    is_default: boolean
}

interface CustomerState {
    customer: Customer | null
    addresses: CustomerAddress[]
    isLoggedIn: boolean
    setCustomer: (customer: Customer | null) => void
    setAddresses: (addresses: CustomerAddress[]) => void
    login: (customer: Customer) => void
    logout: () => void
    clearCustomer: () => void
}

export const useCustomerStore = create<CustomerState>()(
    persist(
        (set) => ({
            customer: null,
            addresses: [],
            isLoggedIn: false,
            setCustomer: (customer) => set({ customer }),
            setAddresses: (addresses) => set({ addresses }),
            login: (customer) => set({ customer, isLoggedIn: true }),
            logout: () => set({ customer: null, addresses: [], isLoggedIn: false }),
            clearCustomer: () => set({ customer: null, addresses: [] })
        }),
        {
            name: 'pedidos-customer-storage',
        }
    )
)
