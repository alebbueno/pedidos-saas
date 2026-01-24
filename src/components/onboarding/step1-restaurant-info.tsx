'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Store, Link as LinkIcon, Phone, MapPin, Lightbulb, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { IMaskInput } from 'react-imask'

interface Step1Props {
    data: {
        name: string
        slug: string
        whatsapp: string
        description: string
        // Address fields
        cep: string
        street: string
        number: string
        complement: string
        neighborhood: string
        city: string
        state: string
    }
    onChange: (data: any) => void
}

export function Step1RestaurantInfo({ data, onChange }: Step1Props) {
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
    const [loadingCep, setLoadingCep] = useState(false)
    const [mapUrl, setMapUrl] = useState('')

    // Auto-generate slug from name
    useEffect(() => {
        if (data.name && !data.slug) {
            const autoSlug = data.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            onChange({ ...data, slug: autoSlug })
        }
    }, [data.name])

    // Fetch address from CEP
    const fetchAddressFromCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '')
        if (cleanCep.length !== 8) return

        setLoadingCep(true)
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
            const addressData = await response.json()

            if (!addressData.erro) {
                onChange({
                    ...data,
                    cep,
                    street: addressData.logradouro || '',
                    neighborhood: addressData.bairro || '',
                    city: addressData.localidade || '',
                    state: addressData.uf || ''
                })
            }
        } catch (error) {
            console.error('Error fetching CEP:', error)
        } finally {
            setLoadingCep(false)
        }
    }

    // Update Google Maps URL when address changes
    useEffect(() => {
        const fullAddress = [
            data.street,
            data.number,
            data.neighborhood,
            data.city,
            data.state,
            data.cep
        ].filter(Boolean).join(', ')

        if (fullAddress) {
            const encodedAddress = encodeURIComponent(fullAddress)
            setMapUrl(`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodedAddress}`)
        }
    }, [data.street, data.number, data.neighborhood, data.city, data.state, data.cep])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                    <Store className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Informações do Restaurante</h2>
                <p className="text-slate-600 text-lg">Vamos começar com as informações básicas do seu negócio</p>
            </div>

            {/* Tip Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                    <strong>Dica:</strong> Escolha um nome fácil de lembrar e que represente bem seu negócio.
                    Isso ajudará seus clientes a encontrarem você!
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
                {/* Restaurant Name */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium">
                        Nome do Restaurante *
                    </Label>
                    <Input
                        id="name"
                        placeholder="Ex: Pizzaria Bella Napoli"
                        value={data.name}
                        onChange={(e) => onChange({ ...data, name: e.target.value })}
                        className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-slate-700 font-medium">
                        Link do Cardápio *
                    </Label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            id="slug"
                            placeholder="pizzaria-bella-napoli"
                            value={data.slug}
                            onChange={(e) => onChange({ ...data, slug: e.target.value })}
                            className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500 pl-10"
                        />
                    </div>
                    <p className="text-sm text-slate-500">
                        Seu cardápio estará disponível em: <span className="font-medium text-orange-600">pedidos-saas.com/lp/{data.slug || 'seu-link'}</span>
                    </p>
                </div>

                {/* WhatsApp with Mask */}
                <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-slate-700 font-medium">
                        WhatsApp Principal *
                    </Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                        <IMaskInput
                            mask="(00) 00000-0000"
                            value={data.whatsapp}
                            onAccept={(value) => onChange({ ...data, whatsapp: value })}
                            placeholder="(11) 99999-9999"
                            className="flex h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pl-10 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-950 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                    </div>
                    <p className="text-sm text-slate-500">
                        Os pedidos serão enviados para este número
                    </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-700 font-medium">
                        Descrição do Restaurante
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Ex: Pizzaria artesanal com mais de 20 anos de tradição. Massa fina e crocante, ingredientes frescos e selecionados."
                        value={data.description}
                        onChange={(e) => onChange({ ...data, description: e.target.value })}
                        className="rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500 min-h-[100px]"
                    />
                    <p className="text-sm text-slate-500">
                        Esta descrição aparecerá no seu cardápio online
                    </p>
                </div>

                {/* Address Section */}
                <div className="pt-4 border-t-2 border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-6 h-6 text-orange-600" />
                        <Label className="text-slate-700 font-medium text-lg">
                            Endereço do Restaurante
                        </Label>
                    </div>

                    <div className="space-y-4">
                        {/* CEP */}
                        <div className="space-y-2">
                            <Label htmlFor="cep" className="text-slate-700 font-medium">
                                CEP *
                            </Label>
                            <div className="relative">
                                <IMaskInput
                                    mask="00000-000"
                                    value={data.cep}
                                    onAccept={(value) => onChange({ ...data, cep: value })}
                                    onBlur={(e) => fetchAddressFromCep(e.currentTarget.value)}
                                    placeholder="00000-000"
                                    className="flex h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                />
                                {loadingCep && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 animate-spin" />
                                )}
                            </div>
                            <p className="text-sm text-slate-500">
                                Digite o CEP para preencher automaticamente o endereço
                            </p>
                        </div>

                        {/* Street and Number */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="street" className="text-slate-700 font-medium">
                                    Rua *
                                </Label>
                                <Input
                                    id="street"
                                    placeholder="Av. Paulista"
                                    value={data.street}
                                    onChange={(e) => onChange({ ...data, street: e.target.value })}
                                    className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="number" className="text-slate-700 font-medium">
                                    Número *
                                </Label>
                                <Input
                                    id="number"
                                    placeholder="1000"
                                    value={data.number}
                                    onChange={(e) => onChange({ ...data, number: e.target.value })}
                                    className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        {/* Complement and Neighborhood */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="complement" className="text-slate-700 font-medium">
                                    Complemento
                                </Label>
                                <Input
                                    id="complement"
                                    placeholder="Loja 5"
                                    value={data.complement}
                                    onChange={(e) => onChange({ ...data, complement: e.target.value })}
                                    className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="neighborhood" className="text-slate-700 font-medium">
                                    Bairro *
                                </Label>
                                <Input
                                    id="neighborhood"
                                    placeholder="Bela Vista"
                                    value={data.neighborhood}
                                    onChange={(e) => onChange({ ...data, neighborhood: e.target.value })}
                                    className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        {/* City and State */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="city" className="text-slate-700 font-medium">
                                    Cidade *
                                </Label>
                                <Input
                                    id="city"
                                    placeholder="São Paulo"
                                    value={data.city}
                                    onChange={(e) => onChange({ ...data, city: e.target.value })}
                                    className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-slate-700 font-medium">
                                    Estado *
                                </Label>
                                <Input
                                    id="state"
                                    placeholder="SP"
                                    maxLength={2}
                                    value={data.state}
                                    onChange={(e) => onChange({ ...data, state: e.target.value.toUpperCase() })}
                                    className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500 uppercase"
                                />
                            </div>
                        </div>

                        {/* Google Maps Preview */}
                        {(data.street && data.city) && (
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">
                                    📍 Localização no Mapa
                                </Label>
                                <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                                            `${data.street}, ${data.number}, ${data.neighborhood}, ${data.city}, ${data.state}`
                                        )}&output=embed`}
                                        allowFullScreen
                                    />
                                </div>
                                <p className="text-sm text-slate-500">
                                    Verifique se o pin está no local correto
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Example Card */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3">📋 Exemplo de preenchimento:</h3>
                <div className="space-y-2 text-sm text-slate-700">
                    <p><strong>Nome:</strong> Pizzaria Bella Napoli</p>
                    <p><strong>Link:</strong> pizzaria-bella-napoli</p>
                    <p><strong>WhatsApp:</strong> (11) 98765-4321</p>
                    <p><strong>Endereço:</strong> Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100</p>
                </div>
            </div>
        </div>
    )
}
