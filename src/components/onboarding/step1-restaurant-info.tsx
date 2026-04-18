'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Store, Link as LinkIcon, Phone, MapPin, Lightbulb, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { IMaskInput } from 'react-imask'
import type { BusinessSegment } from '@/types'
import { BUSINESS_SEGMENT_OPTIONS } from '@/lib/segment-options'
import { cn } from '@/lib/utils'
import { slugifyFromName, isValidPublicSlug } from '@/lib/slug'
import { checkSlugAvailability } from '@/actions/onboarding-actions'

export type Step1RestaurantData = {
    segment: BusinessSegment
    name: string
    slug: string
    whatsapp: string
    description: string
    cep: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
}

interface Step1Props {
    data: Step1RestaurantData
    onChange: (data: Step1RestaurantData) => void
    /** true = slug livre e formato ok; false = inválido ou em uso; null = vazio ou verificando */
    onSlugValidityChange?: (valid: boolean | null) => void
}

export function Step1RestaurantInfo({ data, onChange, onSlugValidityChange }: Step1Props) {
    /** Enquanto true, o slug acompanha o nome automaticamente. */
    const [slugAuto, setSlugAuto] = useState(true)
    const [slugChecking, setSlugChecking] = useState(false)
    const [slugTaken, setSlugTaken] = useState(false)
    const checkSeq = useRef(0)
    const [loadingCep, setLoadingCep] = useState(false)
    const [mapUrl, setMapUrl] = useState('')

    const reportSlugValidity = useCallback(
        (v: boolean | null) => {
            onSlugValidityChange?.(v)
        },
        [onSlugValidityChange]
    )

    const handleNameChange = (name: string) => {
        const next: Step1RestaurantData = { ...data, name }
        if (slugAuto) {
            next.slug = slugifyFromName(name)
        }
        onChange(next)
    }

    const handleSlugChange = (raw: string) => {
        setSlugAuto(false)
        onChange({ ...data, slug: slugifyFromName(raw) })
    }

    const resyncSlugFromName = () => {
        setSlugAuto(true)
        onChange({ ...data, slug: slugifyFromName(data.name) })
    }

    useEffect(() => {
        const slug = data.slug.trim().toLowerCase()
        if (!slug) {
            setSlugChecking(false)
            setSlugTaken(false)
            reportSlugValidity(null)
            return
        }
        if (!isValidPublicSlug(slug)) {
            setSlugChecking(false)
            setSlugTaken(false)
            reportSlugValidity(false)
            return
        }

        const seq = ++checkSeq.current
        setSlugChecking(true)
        reportSlugValidity(null)

        const t = window.setTimeout(async () => {
            try {
                const { available } = await checkSlugAvailability(slug)
                if (seq !== checkSeq.current) return
                setSlugTaken(!available)
                reportSlugValidity(available)
            } catch {
                if (seq !== checkSeq.current) return
                setSlugTaken(false)
                reportSlugValidity(null)
            } finally {
                if (seq === checkSeq.current) setSlugChecking(false)
            }
        }, 400)

        return () => {
            clearTimeout(t)
        }
    }, [data.slug, reportSlugValidity])

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
                <h2 className="text-3xl font-bold text-slate-900">Informações da sua loja</h2>
                <p className="text-slate-600 text-lg">Vamos começar com as informações básicas do seu negócio</p>
            </div>

            {/* Segmento */}
            <div className="space-y-3">
                <Label className="text-slate-800 font-semibold text-base">Qual o tipo do seu negócio? *</Label>
                <p className="text-sm text-slate-500">
                    Ajusta o catálogo e o painel ao que você vende.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUSINESS_SEGMENT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange({ ...data, segment: opt.value })}
                            className={cn(
                                'rounded-2xl border-2 p-4 text-left transition-all hover:border-orange-300 hover:bg-orange-50/50',
                                data.segment === opt.value
                                    ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-200'
                                    : 'border-slate-200 bg-white'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl" aria-hidden>{opt.emoji}</span>
                                <div>
                                    <div className="font-semibold text-slate-900">{opt.label}</div>
                                    <div className="text-xs text-slate-500 mt-1">{opt.hint}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
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
                        Nome da loja ou marca *
                    </Label>
                    <Input
                        id="name"
                        placeholder="Ex: Bella Ateliê, Loja do João, Cantina Central"
                        value={data.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label htmlFor="slug" className="text-slate-700 font-medium">
                            Link da sua loja *
                        </Label>
                        {!slugAuto && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto py-1 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={resyncSlugFromName}
                            >
                                Gerar de novo a partir do nome
                            </Button>
                        )}
                    </div>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            id="slug"
                            placeholder="sua-loja-aqui"
                            value={data.slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            className={cn(
                                'h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500 pl-10 pr-10',
                                data.slug &&
                                    !slugChecking &&
                                    isValidPublicSlug(data.slug) &&
                                    !slugTaken &&
                                    'border-green-500 focus-visible:ring-green-500',
                                data.slug && !slugChecking && (slugTaken || !isValidPublicSlug(data.slug)) &&
                                    'border-red-400 focus-visible:ring-red-400'
                            )}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {slugChecking && <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />}
                            {!slugChecking && data.slug && isValidPublicSlug(data.slug) && !slugTaken && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden />
                            )}
                            {!slugChecking && slugTaken && <XCircle className="w-5 h-5 text-red-500" aria-hidden />}
                            {!slugChecking && data.slug && !isValidPublicSlug(data.slug) && (
                                <AlertCircle className="w-5 h-5 text-amber-500" aria-hidden />
                            )}
                        </div>
                    </div>
                    {slugAuto && data.name.trim() && (
                        <p className="text-xs text-slate-500">O link acompanha o nome. Edite o campo acima se quiser um endereço personalizado.</p>
                    )}
                    {data.slug && !isValidPublicSlug(data.slug) && (
                        <p className="text-sm text-amber-700">
                            Use de 2 a 80 caracteres: letras minúsculas, números e hífen (sem espaços no início ou fim).
                        </p>
                    )}
                    {!slugChecking && data.slug && isValidPublicSlug(data.slug) && slugTaken && (
                        <p className="text-sm text-red-600">Este link já está em uso. Altere o texto para um que ainda não exista.</p>
                    )}
                    {!slugChecking && data.slug && isValidPublicSlug(data.slug) && !slugTaken && (
                        <p className="text-sm text-green-700">Link disponível.</p>
                    )}
                    <p className="text-sm text-slate-500">
                        Sua vitrine online ficará em:{' '}
                        <span className="font-medium text-orange-600">pedidos-saas.com/lp/{data.slug || 'seu-link'}</span>
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
                        Descrição da loja
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Ex: Loja física e envios em todo o Brasil. / Atendimento sob consulta e prazos na descrição do produto."
                        value={data.description}
                        onChange={(e) => onChange({ ...data, description: e.target.value })}
                        className="rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500 min-h-[100px]"
                    />
                    <p className="text-sm text-slate-500">
                        Esta descrição aparece na página pública da sua loja
                    </p>
                </div>

                {/* Address Section */}
                <div className="pt-4 border-t-2 border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-6 h-6 text-orange-600" />
                        <Label className="text-slate-700 font-medium text-lg">
                            Endereço da loja
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
                    <p><strong>Nome:</strong> Bella Ateliê</p>
                    <p><strong>Link:</strong> bella-atelie</p>
                    <p><strong>WhatsApp:</strong> (11) 98765-4321</p>
                    <p><strong>Endereço:</strong> Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100</p>
                </div>
            </div>
        </div>
    )
}
