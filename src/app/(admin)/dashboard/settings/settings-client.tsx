'use client'

import { Restaurant, type BusinessSegment, type ProductType } from '@/types'
import { BUSINESS_SEGMENT_OPTIONS } from '@/lib/segment-options'
import { getSegmentRules } from '@/lib/segment-rules'
import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
    Store, Clock, Phone, Mail, MapPin, Globe, Save, Loader2, Check,
    Truck, Sparkles, Copy, CheckCircle2, XCircle, ExternalLink, Tags,
} from 'lucide-react'
import {
    updateRestaurantInfo,
    updateDeliveryFee,
    updatePaymentMethods,
    updateOpeningHours,
    updateStoreStatus,
    updateRestaurantSegment,
} from '@/actions/settings'
import { useRouter } from 'next/navigation'
import { IMaskInput } from 'react-imask'
import { toast } from 'sonner'

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    simple: 'Simples',
    customizable: 'Com opcionais',
    variant: 'Com variações',
    composed: 'Composto',
}

export default function SettingsClient({
    restaurant,
    stats
}: {
    restaurant: Restaurant
    stats: {
        products: number
        categories: number
        todayOrders: number
    }
}) {
    const router = useRouter()

    // Segmento do negócio (mesmo conceito do cadastro inicial)
    const [segment, setSegment] = useState<BusinessSegment>(
        (restaurant.segment ?? 'food') as BusinessSegment
    )
    const [isSavingSegment, setIsSavingSegment] = useState(false)
    const [segmentSaved, setSegmentSaved] = useState(false)

    const segmentPreview = useMemo(() => {
        const r = getSegmentRules(segment)
        return {
            types: r.allowedProductTypes.map((t) => PRODUCT_TYPE_LABELS[t]).join(' · '),
            half: r.allowHalfAndHalf,
            board: r.ordersBoardStyle === 'kanban' ? 'Kanban' : 'Lista',
        }
    }, [segment])

    // General Info State
    const [name, setName] = useState(restaurant.name)
    const [description, setDescription] = useState(restaurant.description || '')
    const [phone, setPhone] = useState(restaurant.whatsapp_number || '')
    const [email, setEmail] = useState(restaurant.email || '')

    // Address fields - parse from existing address or use empty
    // Address fields - use new columns with fallback to empty
    const [cep, setCep] = useState(restaurant.address_cep || '')
    const [street, setStreet] = useState(restaurant.address_street || '')
    const [number, setNumber] = useState(restaurant.address_number || '')
    const [complement, setComplement] = useState(restaurant.address_complement || '')
    const [neighborhood, setNeighborhood] = useState(restaurant.address_neighborhood || '')
    const [city, setCity] = useState(restaurant.address_city || '')
    const [state, setState] = useState(restaurant.address_state || '')
    const [isLoadingCep, setIsLoadingCep] = useState(false)


    // Delivery & Payment State
    const [deliveryFee, setDeliveryFee] = useState(restaurant.delivery_fee.toString())
    const [minimumOrderValue, setMinimumOrderValue] = useState(restaurant.minimum_order_value?.toString() || '0')
    const [paymentMethods, setPaymentMethods] = useState(restaurant.payment_methods || {
        cash: true,
        credit: true,
        debit: true,
        pix: true,
        voucher: false
    })

    // Opening Hours State
    const [openingHours, setOpeningHours] = useState(() => {
        const value = restaurant.opening_hours
        // Start with default hours
        const defaultHours = {
            monday: { open: '09:00', close: '22:00', enabled: true },
            tuesday: { open: '09:00', close: '22:00', enabled: true },
            wednesday: { open: '09:00', close: '22:00', enabled: true },
            thursday: { open: '09:00', close: '22:00', enabled: true },
            friday: { open: '09:00', close: '22:00', enabled: true },
            saturday: { open: '09:00', close: '22:00', enabled: true },
            sunday: { open: '09:00', close: '22:00', enabled: true }
        }

        if (!value) return defaultHours

        // Handle if needed (DB column is text but might return object depending on driver/client version)
        if (typeof value === 'string') {
            try {
                return JSON.parse(value)
            } catch (e) {
                console.error('Error parsing opening_hours:', e)
                return defaultHours
            }
        }

        return value
    })

    // Store Status
    const [isOpen, setIsOpen] = useState(restaurant.is_open)

    // Loading States
    const [isSavingInfo, setIsSavingInfo] = useState(false)
    const [isSavingDelivery, setIsSavingDelivery] = useState(false)
    const [isSavingHours, setIsSavingHours] = useState(false)
    const [isSavingStatus, setIsSavingStatus] = useState(false)

    // Success States
    const [infoSaved, setInfoSaved] = useState(false)
    const [deliverySaved, setDeliverySaved] = useState(false)
    const [hoursSaved, setHoursSaved] = useState(false)
    const [urlCopied, setUrlCopied] = useState(false)

    // CEP Autocomplete
    const handleCepChange = async (cepValue: string) => {
        const cleanCep = cepValue.replace(/\D/g, '')
        setCep(cepValue)

        if (cleanCep.length === 8) {
            setIsLoadingCep(true)
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
                const data = await response.json()

                if (!data.erro) {
                    setStreet(data.logradouro || '')
                    setNeighborhood(data.bairro || '')
                    setCity(data.localidade || '')
                    setState(data.uf || '')
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error)
            } finally {
                setIsLoadingCep(false)
            }
        }
    }

    const handleSaveSegment = async () => {
        setIsSavingSegment(true)
        const result = await updateRestaurantSegment(restaurant.id, segment)
        if (result.success) {
            setSegmentSaved(true)
            setTimeout(() => setSegmentSaved(false), 2000)
            toast('Segmento atualizado', {
                description: 'Cardápio, tipos de produto e painel passam a seguir este perfil.',
                style: { backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c' },
                icon: <CheckCircle2 className="w-5 h-5 text-orange-500" />,
            })
            router.refresh()
        } else {
            toast.error('Não foi possível salvar o segmento', { description: result.error })
        }
        setIsSavingSegment(false)
    }

    const handleSaveInfo = async () => {
        setIsSavingInfo(true)

        // Build full address from separate fields
        const fullAddress = [
            street && number ? `${street}, ${number}` : '',
            complement,
            neighborhood,
            city && state ? `${city} - ${state}` : '',
            cep ? `CEP: ${cep}` : ''
        ].filter(Boolean).join(', ')

        const result = await updateRestaurantInfo(restaurant.id, {
            name,
            description,
            phone,
            email,
            address: fullAddress,
            address_cep: cep,
            address_street: street,
            address_number: number,
            address_complement: complement,
            address_neighborhood: neighborhood,
            address_city: city,
            address_state: state
        })

        if (result.success) {
            setInfoSaved(true)
            setTimeout(() => setInfoSaved(false), 2000)
            toast('Informações salvas!', {
                description: 'Seus dados foram atualizados com sucesso.',
                style: { backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c' },
                icon: <CheckCircle2 className="w-5 h-5 text-orange-500" />
            })
            router.refresh()
        } else {
            toast.error('Erro ao salvar informações', {
                description: result.error
            })
        }
        setIsSavingInfo(false)
    }

    const handleSaveDeliveryAndPayment = async () => {
        setIsSavingDelivery(true)

        // Update delivery fee
        const feeResult = await updateDeliveryFee(restaurant.id, parseFloat(deliveryFee))

        // Update payment methods
        const methodsResult = await updatePaymentMethods(restaurant.id, paymentMethods)

        if (feeResult.success && methodsResult.success) {
            setDeliverySaved(true)
            setTimeout(() => setDeliverySaved(false), 2000)
            toast('Configurações salvas!', {
                description: 'Dados de envio e pagamento atualizados.',
                style: { backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c' },
                icon: <CheckCircle2 className="w-5 h-5 text-orange-500" />
            })
            router.refresh()
        } else {
            toast.error('Erro ao salvar configurações')
        }
        setIsSavingDelivery(false)
    }

    const handleSaveHours = async () => {
        setIsSavingHours(true)
        const result = await updateOpeningHours(restaurant.id, openingHours)

        if (result.success) {
            setHoursSaved(true)
            setTimeout(() => setHoursSaved(false), 2000)
            toast('Horários atualizados!', {
                description: 'Seus horários de funcionamento foram salvos.',
                style: { backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c' },
                icon: <CheckCircle2 className="w-5 h-5 text-orange-500" />
            })
            router.refresh()
        } else {
            toast.error('Erro ao salvar horários', {
                description: result.error
            })
        }
        setIsSavingHours(false)
    }

    const handleToggleStatus = async (checked: boolean) => {
        setIsSavingStatus(true)
        setIsOpen(checked)

        const result = await updateStoreStatus(restaurant.id, checked)

        if (!result.success) {
            toast.error('Erro ao atualizar status', {
                description: result.error
            })
            setIsOpen(!checked) // Rollback
        } else {
            toast(checked ? 'Vendas ativas' : 'Vendas pausadas', {
                description: checked ? 'Clientes podem finalizar compras no catálogo público.' : 'Novas compras ficam bloqueadas no catálogo público.',
                style: { backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c' },
                icon: <Store className="w-5 h-5 text-orange-500" />
            })
            router.refresh()
        }
        setIsSavingStatus(false)
    }

    const copyMenuUrl = () => {
        const url = `${window.location.origin}/lp/${restaurant.slug}`
        navigator.clipboard.writeText(url)
        setUrlCopied(true)
        setTimeout(() => setUrlCopied(false), 2000)
        toast('Link copiado!', {
            style: { backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c' },
            icon: <CheckCircle2 className="w-5 h-5 text-orange-500" />
        })
    }

    const copyToAllDays = () => {
        const mondayHours = openingHours.monday
        const newHours = { ...openingHours }
        Object.keys(newHours).forEach(day => {
            newHours[day as keyof typeof openingHours] = { ...mondayHours }
        })
        setOpeningHours(newHours)
    }

    const daysMap = [
        { day: 'Segunda-feira', key: 'monday', short: 'Seg' },
        { day: 'Terça-feira', key: 'tuesday', short: 'Ter' },
        { day: 'Quarta-feira', key: 'wednesday', short: 'Qua' },
        { day: 'Quinta-feira', key: 'thursday', short: 'Qui' },
        { day: 'Sexta-feira', key: 'friday', short: 'Sex' },
        { day: 'Sábado', key: 'saturday', short: 'Sáb' },
        { day: 'Domingo', key: 'sunday', short: 'Dom' },
    ]

    return (
        <div className="min-h-screen bg-slate-50 -m-6 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900">Configurações</h1>
                    <p className="text-slate-600 text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                        Gerencie as configurações da sua loja
                    </p>
                </div>

                {/* Welcome Card */}
                <Card className="rounded-3xl border-orange-100 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg shadow-orange-100/50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                                <Store className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 mb-1">Bem-vindo às Configurações!</h3>
                                <p className="text-sm text-slate-700">
                                    Aqui você pode personalizar todas as informações da sua loja,
                                    horários de funcionamento, formas de pagamento e muito mais.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Settings - Left Column (2/3) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Segmento do negócio */}
                        <Card className="rounded-3xl border border-orange-50 shadow-xl shadow-orange-100/50">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                                        <Tags className="w-5 h-5 text-violet-600" />
                                    </div>
                                    Tipo de negócio (segmento)
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Igual à etapa do cadastro: define tipos de produto no catálogo, meio a meio (quando
                                    aplicável), taxa de envio no fluxo e o estilo do painel de pedidos.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 px-8 pb-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {BUSINESS_SEGMENT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setSegment(opt.value)}
                                            className={cn(
                                                'rounded-2xl border-2 p-4 text-left transition-all hover:border-orange-300 hover:bg-orange-50/50',
                                                segment === opt.value
                                                    ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-200'
                                                    : 'border-slate-200 bg-white'
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl" aria-hidden>
                                                    {opt.emoji}
                                                </span>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{opt.label}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{opt.hint}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 space-y-2">
                                    <p className="font-medium text-slate-900">Com este segmento, o sistema usa:</p>
                                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                                        <li>
                                            <span className="font-medium text-slate-800">Tipos de produto:</span>{' '}
                                            {segmentPreview.types}
                                        </li>
                                        <li>
                                            <span className="font-medium text-slate-800">Meio a meio:</span>{' '}
                                            {segmentPreview.half ? 'disponível (quando categoria/produto permitirem)' : 'desligado'}
                                        </li>
                                        <li>
                                            <span className="font-medium text-slate-800">Pedidos no admin:</span>{' '}
                                            visual em {segmentPreview.board}
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveSegment}
                                        disabled={isSavingSegment || segment === (restaurant.segment ?? 'food')}
                                        className="rounded-full bg-violet-600 hover:bg-violet-700 shadow-lg h-12 px-8"
                                    >
                                        {isSavingSegment ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                                            </>
                                        ) : segmentSaved ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" /> Salvo!
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" /> Salvar segmento
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Restaurant Info */}
                        <Card className="rounded-3xl border border-orange-50 shadow-xl shadow-orange-100/50">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Store className="w-5 h-5 text-orange-600" />
                                    </div>
                                    Informações da loja
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Dados básicos que aparecem na página pública da loja
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 px-8 pb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="name" className="text-slate-700 font-medium text-base">
                                            Nome da loja
                                        </Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ex: Loja do João, Ateliê Bella"
                                            className="mt-2 h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="description" className="text-slate-700 font-medium text-base">
                                            Descrição
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Descreva sua loja ou marca..."
                                            className="mt-2 min-h-[100px] rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone" className="text-slate-700 font-medium text-base">
                                            Telefone
                                        </Label>
                                        <div className="relative mt-2">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                                            <IMaskInput
                                                mask="(00) 00000-0000"
                                                value={phone}
                                                onAccept={(value) => setPhone(value)}
                                                placeholder="(11) 99999-9999"
                                                className="flex h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pl-10 text-base ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="text-slate-700 font-medium text-base">
                                            Email
                                        </Label>
                                        <div className="relative mt-2">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="contato@suaempresa.com"
                                                className="pl-10 h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>


                                    {/* Address Fields */}
                                    <div className="md:col-span-2">
                                        <Label className="text-slate-700 font-medium text-base mb-3 block">
                                            <MapPin className="w-4 h-4 inline mr-2" />
                                            Endereço Completo
                                        </Label>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* CEP */}
                                            <div>
                                                <Label htmlFor="cep" className="text-sm text-slate-600">CEP</Label>
                                                <IMaskInput
                                                    id="cep"
                                                    mask="00000-000"
                                                    value={cep}
                                                    onAccept={(value) => handleCepChange(value)}
                                                    placeholder="00000-000"
                                                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1"
                                                />
                                                {isLoadingCep && <p className="text-xs text-orange-600 mt-1">Buscando...</p>}
                                            </div>

                                            {/* Street */}
                                            <div className="md:col-span-2">
                                                <Label htmlFor="street" className="text-sm text-slate-600">Rua</Label>
                                                <Input
                                                    id="street"
                                                    value={street}
                                                    onChange={(e) => setStreet(e.target.value)}
                                                    placeholder="Nome da rua"
                                                    className="h-10 rounded-lg mt-1"
                                                />
                                            </div>

                                            {/* Number */}
                                            <div>
                                                <Label htmlFor="number" className="text-sm text-slate-600">Número</Label>
                                                <Input
                                                    id="number"
                                                    value={number}
                                                    onChange={(e) => setNumber(e.target.value)}
                                                    placeholder="123"
                                                    className="h-10 rounded-lg mt-1"
                                                />
                                            </div>

                                            {/* Complement */}
                                            <div className="md:col-span-2">
                                                <Label htmlFor="complement" className="text-sm text-slate-600">Complemento</Label>
                                                <Input
                                                    id="complement"
                                                    value={complement}
                                                    onChange={(e) => setComplement(e.target.value)}
                                                    placeholder="Apto, sala, etc (opcional)"
                                                    className="h-10 rounded-lg mt-1"
                                                />
                                            </div>

                                            {/* Neighborhood */}
                                            <div>
                                                <Label htmlFor="neighborhood" className="text-sm text-slate-600">Bairro</Label>
                                                <Input
                                                    id="neighborhood"
                                                    value={neighborhood}
                                                    onChange={(e) => setNeighborhood(e.target.value)}
                                                    placeholder="Bairro"
                                                    className="h-10 rounded-lg mt-1"
                                                />
                                            </div>

                                            {/* City */}
                                            <div>
                                                <Label htmlFor="city" className="text-sm text-slate-600">Cidade</Label>
                                                <Input
                                                    id="city"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    placeholder="Cidade"
                                                    className="h-10 rounded-lg mt-1"
                                                />
                                            </div>

                                            {/* State */}
                                            <div>
                                                <Label htmlFor="state" className="text-sm text-slate-600">Estado</Label>
                                                <Input
                                                    id="state"
                                                    value={state}
                                                    onChange={(e) => setState(e.target.value)}
                                                    placeholder="UF"
                                                    maxLength={2}
                                                    className="h-10 rounded-lg mt-1 uppercase"
                                                />
                                            </div>
                                        </div>

                                        {/* Google Maps */}
                                        {street && city && state && (
                                            <div className="mt-4 rounded-xl overflow-hidden border-2 border-slate-200">
                                                <iframe
                                                    width="100%"
                                                    height="300"
                                                    style={{ border: 0 }}
                                                    loading="lazy"
                                                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${street}, ${number}, ${city}, ${state}`)}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveInfo}
                                        disabled={isSavingInfo}
                                        className="rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 hover:scale-105 transition-transform h-12 px-8"
                                    >
                                        {isSavingInfo ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                                        ) : infoSaved ? (
                                            <><Check className="w-4 h-4 mr-2" /> Salvo!</>
                                        ) : (
                                            <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery & Payment Settings */}
                        <Card className="rounded-3xl border border-orange-50 shadow-xl shadow-orange-100/50">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-green-600" />
                                    </div>
                                    Envio e pagamento
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Configure taxas de envio e formas de pagamento aceitas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 px-8 pb-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="delivery_fee" className="text-slate-700 font-medium text-base">
                                            Taxa de envio (R$)
                                        </Label>
                                        <div className="relative mt-2">
                                            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                id="delivery_fee"
                                                type="number"
                                                step="0.01"
                                                value={deliveryFee}
                                                onChange={(e) => setDeliveryFee(e.target.value)}
                                                placeholder="0.00"
                                                className="pl-10 h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Valor cobrado quando o cliente escolhe envio</p>
                                    </div>

                                    <div>
                                        <Label htmlFor="minimum_order" className="text-slate-700 font-medium text-base">
                                            Compra mínima (R$)
                                        </Label>
                                        <div className="relative mt-2">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                                                R$
                                            </span>
                                            <Input
                                                id="minimum_order"
                                                type="number"
                                                step="0.01"
                                                value={minimumOrderValue}
                                                onChange={(e) => setMinimumOrderValue(e.target.value)}
                                                placeholder="0.00"
                                                className="pl-10 h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Valor mínimo do carrinho para aceitar a compra</p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label className="mb-4 block text-slate-700 font-medium text-base">
                                        Formas de Pagamento Aceitas
                                    </Label>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {[
                                            { key: 'cash', label: 'Dinheiro', desc: 'Pagamento em espécie', emoji: '💵' },
                                            { key: 'credit', label: 'Cartão de Crédito', desc: 'Visa, Mastercard, Elo', emoji: '💳' },
                                            { key: 'debit', label: 'Cartão de Débito', desc: 'Todas as bandeiras', emoji: '💳' },
                                            { key: 'pix', label: 'PIX', desc: 'Pagamento instantâneo', emoji: '📱' },
                                            { key: 'voucher', label: 'Vale ou cartão benefício', desc: 'Sodexo, Alelo, VR e similares', emoji: '🎫' },
                                        ].map((method) => (
                                            <div
                                                key={method.key}
                                                className={`flex items-center justify-between p-4 border-2 rounded-2xl transition-all cursor-pointer ${paymentMethods[method.key as keyof typeof paymentMethods]
                                                    ? 'border-orange-300 bg-orange-50/30'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                                onClick={() => setPaymentMethods({
                                                    ...paymentMethods,
                                                    [method.key]: !paymentMethods[method.key as keyof typeof paymentMethods]
                                                })}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                                                        <span className="text-xl">{method.emoji}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-slate-900">{method.label}</p>
                                                        <p className="text-xs text-slate-500">{method.desc}</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={paymentMethods[method.key as keyof typeof paymentMethods] || false}
                                                    onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, [method.key]: checked })}
                                                    className="data-[state=checked]:bg-orange-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveDeliveryAndPayment}
                                        disabled={isSavingDelivery}
                                        className="rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 hover:scale-105 transition-transform h-12 px-8"
                                    >
                                        {isSavingDelivery ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                                        ) : deliverySaved ? (
                                            <><Check className="w-4 h-4 mr-2" /> Salvo!</>
                                        ) : (
                                            <><Save className="w-4 h-4 mr-2" /> Salvar Configurações</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Hours */}
                        <Card className="rounded-3xl border border-orange-50 shadow-xl shadow-orange-100/50">
                            <CardHeader className="pb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-3 text-2xl">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-blue-600" />
                                            </div>
                                            Horário de Funcionamento
                                        </CardTitle>
                                        <CardDescription className="text-base mt-2">
                                            Configure os horários de abertura e fechamento
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyToAllDays}
                                        className="rounded-full border-orange-300 text-orange-600 hover:bg-orange-50"
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copiar Segunda
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 px-8 pb-8">
                                {daysMap.map((item) => (
                                    <div
                                        key={item.key}
                                        className={`p-4 rounded-2xl border-2 transition-all ${openingHours[item.key]?.enabled
                                            ? 'border-green-200 bg-green-50/30'
                                            : 'border-slate-200 bg-slate-50/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3 min-w-[180px]">
                                                <Switch
                                                    checked={openingHours[item.key]?.enabled || false}
                                                    onCheckedChange={(checked) => setOpeningHours({
                                                        ...openingHours,
                                                        [item.key]: { ...openingHours[item.key], enabled: checked }
                                                    })}
                                                    className="data-[state=checked]:bg-green-500"
                                                />
                                                <span className="font-semibold text-slate-900">{item.day}</span>
                                            </div>

                                            {openingHours[item.key]?.enabled ? (
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Input
                                                        type="time"
                                                        value={openingHours[item.key]?.open || '09:00'}
                                                        onChange={(e) => setOpeningHours({
                                                            ...openingHours,
                                                            [item.key]: { ...openingHours[item.key], open: e.target.value }
                                                        })}
                                                        className="w-32 h-10 rounded-lg border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                                    />
                                                    <span className="text-slate-400 font-medium">até</span>
                                                    <Input
                                                        type="time"
                                                        value={openingHours[item.key]?.close || '22:00'}
                                                        onChange={(e) => setOpeningHours({
                                                            ...openingHours,
                                                            [item.key]: { ...openingHours[item.key], close: e.target.value }
                                                        })}
                                                        className="w-32 h-10 rounded-lg border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Fechado</span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <Separator />

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveHours}
                                        disabled={isSavingHours}
                                        className="rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 hover:scale-105 transition-transform h-12 px-8"
                                    >
                                        {isSavingHours ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                                        ) : hoursSaved ? (
                                            <><Check className="w-4 h-4 mr-2" /> Salvo!</>
                                        ) : (
                                            <><Save className="w-4 h-4 mr-2" /> Salvar Horários</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Right Column (1/3) */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card className="rounded-3xl border border-orange-50 shadow-xl shadow-orange-100/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Status das vendas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {isOpen ? 'Aberto para pedidos' : 'Fechado para novos pedidos'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {isOpen ? 'Catálogo público aceita checkout' : 'Catálogo público sem checkout'}
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isOpen}
                                        onCheckedChange={handleToggleStatus}
                                        disabled={isSavingStatus}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <span className="text-sm text-slate-600 font-medium block">Link público da loja</span>

                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg shadow-sm border border-orange-100">
                                                <Globe className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-[10px] uppercase tracking-wider text-orange-600 font-bold mb-0.5">Seu link exclusivo</p>
                                                <div className="flex items-center gap-1 font-mono text-sm text-slate-800 font-bold truncate">
                                                    <span className="text-slate-400">pedidos.com/lp/</span>
                                                    <span className="text-orange-600">{restaurant.slug}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={copyMenuUrl}
                                                className="rounded-xl border-orange-200 text-slate-700 hover:bg-orange-100 hover:text-orange-700 h-9 bg-white"
                                            >
                                                {urlCopied ? (
                                                    <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Copiado</>
                                                ) : (
                                                    <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar</>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`/lp/${restaurant.slug}`, '_blank')}
                                                className="rounded-xl border-orange-200 text-slate-700 hover:bg-orange-100 hover:text-orange-700 h-9 bg-white"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Visitar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="rounded-3xl border border-orange-50 shadow-xl shadow-orange-100/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Estatísticas Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
                                    <span className="text-sm text-slate-700 font-medium">Produtos Ativos</span>
                                    <span className="font-bold text-blue-600">{stats.products}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50">
                                    <span className="text-sm text-slate-700 font-medium">Categorias</span>
                                    <span className="font-bold text-purple-600">{stats.categories}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                                    <span className="text-sm text-slate-700 font-medium">Pedidos Hoje</span>
                                    <span className="font-bold text-green-600">{stats.todayOrders}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="rounded-3xl border-2 border-red-200 bg-red-50/30 shadow-lg shadow-red-100/50">
                            <CardHeader>
                                <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                                    <XCircle className="w-5 h-5" />
                                    Zona de Perigo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 mb-4">
                                    Ações irreversíveis que afetam sua conta
                                </p>
                                <Button
                                    variant="destructive"
                                    className="w-full rounded-full"
                                    size="sm"
                                >
                                    Excluir loja
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
