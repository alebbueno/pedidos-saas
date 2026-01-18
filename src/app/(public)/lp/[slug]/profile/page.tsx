'use client'

import { useEffect, useState } from 'react'
import { useCustomerStore } from '@/store/customer-store'
import { getCustomerAddresses, saveCustomerAddress, deleteCustomerAddress, findOrCreateCustomer } from '@/actions/customer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Loader2, User, Mail, Phone, MapPin, Trash2, Plus, LogOut, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Restaurant } from '@/types'
import { getRestaurantBySlug } from '@/actions/restaurant'

export default function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter()
    const customer = useCustomerStore((state) => state.customer)
    const isLoggedIn = useCustomerStore((state) => state.isLoggedIn)
    const addresses = useCustomerStore((state) => state.addresses)
    const setCustomer = useCustomerStore((state) => state.setCustomer)
    const setAddresses = useCustomerStore((state) => state.setAddresses)
    const logout = useCustomerStore((state) => state.logout)

    const [name, setName] = useState(customer?.name || '')
    const [email, setEmail] = useState(customer?.email || '')
    const [newAddress, setNewAddress] = useState({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

    useEffect(() => {
        const loadData = async () => {
            const { slug } = await params
            const rest = await getRestaurantBySlug(slug)
            setRestaurant(rest)

            if (!isLoggedIn || !customer) {
                router.push(`/lp/${slug}`)
                return
            }

            setIsLoading(true)
            const result = await getCustomerAddresses(customer.id)
            if (result.success && result.addresses) {
                setAddresses(result.addresses)
            }
            setIsLoading(false)
        }

        loadData()
    }, [customer, isLoggedIn, router, params, setAddresses])

    useEffect(() => {
        if (customer) {
            setName(customer.name)
            setEmail(customer.email || '')
        }
    }, [customer])

    if (!restaurant) return null

    const primaryColor = restaurant.primary_color || '#F97316'

    const handleSaveProfile = async () => {
        if (!customer) return

        setIsSaving(true)
        const result = await findOrCreateCustomer(customer.phone, name, email)
        if (result.success && result.customer) {
            setCustomer(result.customer)
        }
        setIsSaving(false)
    }

    const handleAddAddress = async () => {
        if (!customer) return

        // Validate required fields
        if (!newAddress.street.trim() || !newAddress.number.trim() ||
            !newAddress.neighborhood.trim() || !newAddress.city.trim()) {
            return
        }

        setIsSaving(true)
        const result = await saveCustomerAddress(
            customer.id,
            newAddress.street,
            newAddress.number,
            newAddress.neighborhood,
            newAddress.city,
            newAddress.complement || undefined,
            undefined, // reference
            addresses.length === 0 // isDefault
        )
        if (result.success && result.address) {
            const updatedAddresses = await getCustomerAddresses(customer.id)
            if (updatedAddresses.success && updatedAddresses.addresses) {
                setAddresses(updatedAddresses.addresses)
            }
            setNewAddress({
                street: '',
                number: '',
                complement: '',
                neighborhood: '',
                city: ''
            })
        }
        setIsSaving(false)
    }

    const handleDeleteAddress = async (addressId: string) => {
        setIsSaving(true)
        await deleteCustomerAddress(addressId)
        const updatedAddresses = await getCustomerAddresses(customer!.id)
        if (updatedAddresses.success && updatedAddresses.addresses) {
            setAddresses(updatedAddresses.addresses)
        }
        setIsSaving(false)
    }

    const handleLogout = () => {
        logout()
        router.push(`/lp/${restaurant.slug}`)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b shadow-sm mb-8">
                <div className="container mx-auto px-4 max-w-2xl py-8">
                    <Button
                        variant="ghost"
                        className="mb-6 pl-0 hover:bg-transparent hover:opacity-70 text-gray-500"
                        onClick={() => router.push(`/lp/${restaurant.slug}`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Cardápio
                    </Button>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {customer?.name?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{customer?.name}</h1>
                            <p className="text-gray-500 py-1 px-3 bg-gray-100 rounded-full text-sm inline-block mt-1">
                                {customer?.phone}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-2xl pb-12">

                {/* Personal Info */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <User className="w-5 h-5 text-gray-500" />
                        Seus Dados
                    </h2>
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardContent className="space-y-4 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-600">Nome Completo</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-600">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="w-full md:w-auto mt-2"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Salvar Alterações
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Addresses */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        Endereços
                    </h2>
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {addresses.map((address) => (
                                        <div key={address.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 group">
                                            <div className="p-2 rounded-full bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-gray-600 group-hover:shadow-sm transition-all">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{address.address}</p>
                                                {address.is_default && (
                                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                        Principal
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteAddress(address.id)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    {addresses.length === 0 && (
                                        <div className="text-center py-8 px-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                                <MapPin className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 text-sm">Nenhum endereço salvo ainda</p>
                                        </div>
                                    )}

                                    {/* Add New Address */}
                                    <div className="p-5 bg-gray-50/50 border-t">
                                        <div className="space-y-4">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Novo Endereço</Label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {/* Street */}
                                                <div className="md:col-span-1">
                                                    <Label className="text-sm text-gray-600 mb-1.5 block">
                                                        Rua/Avenida <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        value={newAddress.street}
                                                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                                        placeholder="Nome da rua"
                                                        className="bg-white"
                                                    />
                                                </div>

                                                {/* Number */}
                                                <div className="md:col-span-1">
                                                    <Label className="text-sm text-gray-600 mb-1.5 block">
                                                        Número <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        value={newAddress.number}
                                                        onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                                                        placeholder="123"
                                                        className="bg-white"
                                                    />
                                                </div>

                                                {/* Complement */}
                                                <div className="md:col-span-2">
                                                    <Label className="text-sm text-gray-600 mb-1.5 block">
                                                        Complemento
                                                    </Label>
                                                    <Input
                                                        value={newAddress.complement}
                                                        onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                                                        placeholder="Apto, bloco, etc (opcional)"
                                                        className="bg-white"
                                                    />
                                                </div>

                                                {/* Neighborhood */}
                                                <div className="md:col-span-1">
                                                    <Label className="text-sm text-gray-600 mb-1.5 block">
                                                        Bairro <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        value={newAddress.neighborhood}
                                                        onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                                                        placeholder="Nome do bairro"
                                                        className="bg-white"
                                                    />
                                                </div>

                                                {/* City */}
                                                <div className="md:col-span-1">
                                                    <Label className="text-sm text-gray-600 mb-1.5 block">
                                                        Cidade <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        value={newAddress.city}
                                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                        placeholder="Nome da cidade"
                                                        className="bg-white"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleAddAddress}
                                                disabled={isSaving || !newAddress.street.trim() || !newAddress.number.trim() ||
                                                    !newAddress.neighborhood.trim() || !newAddress.city.trim()}
                                                className="w-full"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Adicionar Endereço
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Logout */}
                <div className="flex justify-center">
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-2 px-6 py-6"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair da minha conta
                    </Button>
                </div>
            </div>
        </div>
    )
}
