'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, MapPin, Phone, ShoppingBag, Eye, User } from 'lucide-react'
import { getCustomers } from '@/actions/admin'
import { CustomerSheet } from './CustomerSheet'
import { useDebouncedCallback } from 'use-debounce'

interface CustomersClientProps {
    restaurantId: string
    initialCustomers: any[]
}

export function CustomersClient({ restaurantId, initialCustomers }: CustomersClientProps) {
    const [customers, setCustomers] = useState(initialCustomers)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

    const handleSearch = useDebouncedCallback(async (query: string) => {
        setIsSearching(true)
        try {
            const results = await getCustomers(restaurantId, query)
            setCustomers(results)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSearching(false)
        }
    }, 500)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar por nome ou telefone..."
                        className="pl-9"
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            handleSearch(e.target.value)
                        }}
                    />
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-base font-semibold">
                        Lista de Clientes ({customers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {customers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            {searchQuery ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {customers.map((customer) => (
                                <div key={customer.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{customer.name}</h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {customer.phone}
                                                </div>
                                                {customer.address && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="truncate max-w-[200px]">{customer.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 sm:gap-8 ml-13 sm:ml-0">
                                        <div className="text-center min-w-[80px]">
                                            <div className="flex items-center justify-center gap-1.5 text-gray-900 font-semibold">
                                                <ShoppingBag className="h-4 w-4 text-orange-500" />
                                                {customer.order_count}
                                            </div>
                                            <div className="text-xs text-gray-500">Pedidos</div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedCustomerId(customer.id)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Detalhes
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CustomerSheet
                customerId={selectedCustomerId}
                onClose={() => setSelectedCustomerId(null)}
            />
        </div>
    )
}
