'use client'

import { useCartStore } from '@/store/cart-store'
import { useCustomerStore } from '@/store/customer-store'
import { Restaurant } from '@/types'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createOrder } from '@/actions/restaurant'
import { findOrCreateCustomer, getCustomerByPhone, getCustomerAddresses, saveCustomerAddress } from '@/actions/customer'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, ArrowRight, User, MapPin, CreditCard, CheckCircle, Phone, Mail, Home, Truck, Store } from 'lucide-react'
import StepIndicator from './step-indicator'
import { cn } from '@/lib/utils'

const STEPS = [
    { number: 1, title: 'Seus Dados', description: 'Identificação' },
    { number: 2, title: 'Entrega', description: 'Endereço' },
    { number: 3, title: 'Pagamento', description: 'Forma de pagamento' },
    { number: 4, title: 'Confirmar', description: 'Revisar pedido' }
]

export default function CheckoutForm({ restaurant }: { restaurant: Restaurant }) {
    const router = useRouter()
    const items = useCartStore((state) => state.items)
    const total = useCartStore((state) => state.total)
    const clearCart = useCartStore((state) => state.clearCart)

    const customer = useCustomerStore((state) => state.customer)
    const setCustomer = useCustomerStore((state) => state.setCustomer)
    const addresses = useCustomerStore((state) => state.addresses)
    const setAddresses = useCustomerStore((state) => state.setAddresses)

    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingCustomer, setIsLoadingCustomer] = useState(false)

    // Step 1: Customer Info
    const [phone, setPhone] = useState(customer?.phone || '')
    const [name, setName] = useState(customer?.name || '')
    const [email, setEmail] = useState(customer?.email || '')

    // Step 2: Delivery
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
    const [selectedAddressId, setSelectedAddressId] = useState<string>('')
    const [newAddress, setNewAddress] = useState({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: ''
    })
    const [saveAddress, setSaveAddress] = useState(false)
    const [showNewAddressForm, setShowNewAddressForm] = useState(false)

    // Step 3: Payment
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card_machine' | 'money'>('pix')
    const [changeFor, setChangeFor] = useState('')

    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const cartTotal = total()
    const deliveryFee = deliveryType === 'delivery' ? (restaurant.delivery_fee || 0) : 0
    const finalTotal = cartTotal + deliveryFee

    const primaryColor = restaurant.primary_color || '#F97316'

    if (!mounted) return null
    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-lg text-gray-600 mb-4">Seu carrinho está vazio.</p>
                <Button onClick={() => router.push(`/lp/${restaurant.slug}`)}>
                    Ver Cardápio
                </Button>
            </div>
        )
    }

    // Phone mask function
    const formatPhone = (value: string) => {
        // Remove all non-digits
        const numbers = value.replace(/\D/g, '')

        // Apply mask: (XX) XXXXX-XXXX
        if (numbers.length <= 2) {
            return numbers
        } else if (numbers.length <= 7) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
        } else if (numbers.length <= 11) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
        }
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }

    // Load customer data when phone changes
    const handlePhoneChange = async (phoneValue: string) => {
        // Format the phone number for display
        const formatted = formatPhone(phoneValue)
        setPhone(formatted)

        // Extract only numbers for API calls
        const numbersOnly = phoneValue.replace(/\D/g, '')

        // Only search if phone has at least 10 digits
        if (numbersOnly.length >= 10) {
            setIsLoadingCustomer(true)
            const result = await getCustomerByPhone(numbersOnly)

            if (result.success && result.customer) {
                setCustomer(result.customer)
                setName(result.customer.name)
                setEmail(result.customer.email || '')

                // Load addresses
                const addressResult = await getCustomerAddresses(result.customer.id)
                if (addressResult.success && addressResult.addresses) {
                    setAddresses(addressResult.addresses)
                    const defaultAddr = addressResult.addresses.find(a => a.is_default)
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr.id)
                    }
                }
            }
            setIsLoadingCustomer(false)
        }
    }

    const canProceedStep1 = phone.replace(/\D/g, '').length >= 10 && name.length >= 2
    const canProceedStep2 = deliveryType === 'pickup' || selectedAddressId ||
        (newAddress.street.trim() && newAddress.number.trim() && newAddress.neighborhood.trim() && newAddress.city.trim())
    const canProceedStep3 = paymentMethod !== null

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)

        try {
            // Extract only numbers from phone
            const phoneNumbers = phone.replace(/\D/g, '')

            // 1. Create or update customer
            const customerResult = await findOrCreateCustomer(phoneNumbers, name, email)
            if (!customerResult.success || !customerResult.customer) {
                alert('Erro ao salvar dados do cliente')
                setIsSubmitting(false)
                return
            }

            const customerId = customerResult.customer.id

            // 2. Save new address if provided and concatenate it
            let fullNewAddress = ''
            if (deliveryType === 'delivery' && newAddress.street) {
                fullNewAddress = `${newAddress.street}, ${newAddress.number}`
                if (newAddress.complement) fullNewAddress += `, ${newAddress.complement}`
                fullNewAddress += `, ${newAddress.neighborhood}, ${newAddress.city}`

                if (saveAddress) {
                    await saveCustomerAddress(
                        customerId,
                        newAddress.street,
                        newAddress.number,
                        newAddress.neighborhood,
                        newAddress.city,
                        newAddress.complement || undefined,
                        undefined,
                        true
                    )
                }
            }

            // 3. Get final address
            const finalAddress = deliveryType === 'delivery'
                ? (fullNewAddress || addresses.find(a => a.id === selectedAddressId)?.address || '')
                : ''

            // 4. Create order
            const orderData = {
                restaurantId: restaurant.id,
                customerId,
                total: finalTotal,
                items,
                name,
                phone: phoneNumbers,
                deliveryType,
                address: finalAddress,
                paymentMethod,
                changeFor: paymentMethod === 'money' ? changeFor : undefined
            }

            const result = await createOrder(orderData)

            if (result.success && result.order) {
                // Build WhatsApp message
                const itemsList = items.map(item => {
                    if (item.half_and_half) {
                        // Half and half item with product names
                        const firstProduct = item.half_and_half.first_half.product.name
                        const secondProduct = item.half_and_half.second_half.product.name
                        const firstOpts = item.half_and_half.first_half.options.map(o => o.option_name).join(', ')
                        const secondOpts = item.half_and_half.second_half.options.map(o => o.option_name).join(', ')

                        return `${item.quantity}x Meio a Meio 🍕\\n   1ª metade: ${firstProduct}${firstOpts ? ` (${firstOpts})` : ''}\\n   2ª metade: ${secondProduct}${secondOpts ? ` (${secondOpts})` : ''} - R$ ${item.totalPrice.toFixed(2)}`
                    } else {
                        // Normal item
                        const opts = item.selectedOptions?.map(o => `${o.group_name}: ${o.option_name}`).join(', ') || ''
                        return `${item.quantity}x ${item.product.name}${opts ? `\\n   ${opts}` : ''} - R$ ${item.totalPrice.toFixed(2)}`
                    }
                }).join('\\n')

                const paymentText = paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'card_machine' ? 'Cartão na entrega' : `Dinheiro${changeFor ? ` (Troco para R$ ${changeFor})` : ''}`

                const message = `*Novo Pedido #${result.order.id.slice(0, 8)}*

*Cliente:* ${name}
*Telefone:* ${phone}

*Itens:*
${itemsList}

*Subtotal:* R$ ${cartTotal.toFixed(2)}
*Entrega:* ${deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2)}` : 'Grátis'}
*TOTAL:* R$ ${finalTotal.toFixed(2)}

*Tipo:* ${deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
${deliveryType === 'delivery' ? `*Endereço:* ${finalAddress}` : ''}

*Pagamento:* ${paymentText}`

                const encodedMessage = encodeURIComponent(message)
                const waUrl = `https://wa.me/${restaurant.whatsapp_number}?text=${encodedMessage}`

                clearCart()
                // Open separate tab for WhatsApp
                window.open(waUrl, '_blank')
                // Redirect internal navigation to orders page
                router.push(`/lp/${restaurant.slug}/my-orders`)
            } else {
                alert('Erro ao criar pedido. Tente novamente.')
            }
        } catch (e) {
            console.error(e)
            alert('Erro inesperado.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Step Indicator */}
            <StepIndicator steps={STEPS} currentStep={currentStep} primaryColor={primaryColor} />

            <div className="grid gap-6 md:grid-cols-3 mt-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Step 1: Customer Info */}
                    {currentStep === 1 && (
                        <Card className="animate-in slide-in-from-right duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" style={{ color: primaryColor }} />
                                    Seus Dados
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        WhatsApp (com DDD)
                                    </Label>
                                    <Input
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        placeholder="(11) 99999-9999"
                                        className="h-12 text-lg"
                                        maxLength={15}
                                    />
                                    {isLoadingCustomer && <p className="text-sm text-gray-500">Buscando seus dados...</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Nome Completo</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        className="h-12 text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        E-mail (opcional)
                                    </Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="h-12 text-lg"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Delivery */}
                    {currentStep === 2 && (
                        <Card className="animate-in slide-in-from-right duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                                    Entrega
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Delivery Type */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setDeliveryType('delivery')}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                            deliveryType === 'delivery'
                                                ? "border-current shadow-md scale-105"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                        style={deliveryType === 'delivery' ? { borderColor: primaryColor } : {}}
                                    >
                                        <Truck className="w-8 h-8" style={deliveryType === 'delivery' ? { color: primaryColor } : {}} />
                                        <span className="font-semibold">Entrega</span>
                                        <span className="text-sm font-semibold" style={deliveryType === 'delivery' ? { color: primaryColor } : {}}>
                                            + R$ {restaurant.delivery_fee.toFixed(2)}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setDeliveryType('pickup')}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                            deliveryType === 'pickup'
                                                ? "border-current shadow-md scale-105"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                        style={deliveryType === 'pickup' ? { borderColor: primaryColor } : {}}
                                    >
                                        <Store className="w-8 h-8" style={deliveryType === 'pickup' ? { color: primaryColor } : {}} />
                                        <span className="font-semibold">Retirada</span>
                                        <span className="text-sm text-gray-500">Grátis</span>
                                    </button>
                                </div>

                                {/* Show restaurant address for pickup */}
                                {deliveryType === 'pickup' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in slide-in-from-top duration-300">
                                        <div className="flex gap-3">
                                            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-blue-900 mb-1">Endereço para retirada:</p>
                                                <p className="text-sm text-blue-800">{restaurant.address || 'Endereço não cadastrado'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Address Selection */}
                                {deliveryType === 'delivery' && (
                                    <div className="space-y-4">
                                        {/* Button to show new address form when addresses exist */}
                                        {addresses.length > 0 && !showNewAddressForm && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowNewAddressForm(true)
                                                    setSelectedAddressId('')
                                                }}
                                                className="w-full"
                                            >
                                                + Adicionar Novo Endereço
                                            </Button>
                                        )}
                                        {/* Saved Addresses */}
                                        {addresses.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Endereços Salvos</Label>
                                                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                                                    {addresses.map((addr) => (
                                                        <div key={addr.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                                                            <RadioGroupItem value={addr.id} id={addr.id} />
                                                            <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                                                                <Home className="w-4 h-4 inline mr-2" />
                                                                {addr.address}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                        )}

                                        {/* New Address Form */}
                                        {(addresses.length === 0 || showNewAddressForm) && (
                                            <div className="space-y-4">
                                                <Label className="text-base font-semibold">Novo Endereço</Label>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {/* Street */}
                                                    <div className="md:col-span-1">
                                                        <Label className="text-sm">Rua/Avenida <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            value={newAddress.street}
                                                            onChange={(e) => {
                                                                setNewAddress({ ...newAddress, street: e.target.value })
                                                                setSelectedAddressId('')
                                                            }}
                                                            placeholder="Nome da rua"
                                                            className="mt-1"
                                                        />
                                                    </div>

                                                    {/* Number */}
                                                    <div className="md:col-span-1">
                                                        <Label className="text-sm">Número <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            value={newAddress.number}
                                                            onChange={(e) => {
                                                                setNewAddress({ ...newAddress, number: e.target.value })
                                                                setSelectedAddressId('')
                                                            }}
                                                            placeholder="123"
                                                            className="mt-1"
                                                        />
                                                    </div>

                                                    {/* Complement */}
                                                    <div className="md:col-span-2">
                                                        <Label className="text-sm">Complemento</Label>
                                                        <Input
                                                            value={newAddress.complement}
                                                            onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                                                            placeholder="Apto, bloco, etc (opcional)"
                                                            className="mt-1"
                                                        />
                                                    </div>

                                                    {/* Neighborhood */}
                                                    <div className="md:col-span-1">
                                                        <Label className="text-sm">Bairro <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            value={newAddress.neighborhood}
                                                            onChange={(e) => {
                                                                setNewAddress({ ...newAddress, neighborhood: e.target.value })
                                                                setSelectedAddressId('')
                                                            }}
                                                            placeholder="Nome do bairro"
                                                            className="mt-1"
                                                        />
                                                    </div>

                                                    {/* City */}
                                                    <div className="md:col-span-1">
                                                        <Label className="text-sm">Cidade <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            value={newAddress.city}
                                                            onChange={(e) => {
                                                                setNewAddress({ ...newAddress, city: e.target.value })
                                                                setSelectedAddressId('')
                                                            }}
                                                            placeholder="Nome da cidade"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>

                                                {customer && newAddress.street && (
                                                    <label className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={saveAddress}
                                                            onChange={(e) => setSaveAddress(e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        Salvar este endereço para próximos pedidos
                                                    </label>
                                                )}

                                                {/* Cancel button when showing new address form */}
                                                {addresses.length > 0 && showNewAddressForm && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setShowNewAddressForm(false)
                                                            setNewAddress({
                                                                street: '',
                                                                number: '',
                                                                complement: '',
                                                                neighborhood: '',
                                                                city: ''
                                                            })
                                                        }}
                                                        className="w-full"
                                                    >
                                                        Cancelar
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Payment */}
                    {currentStep === 3 && (
                        <Card className="animate-in slide-in-from-right duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
                                    Forma de Pagamento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as any)}>
                                    <div
                                        className={cn(
                                            "flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                                            paymentMethod === 'pix' ? "border-current shadow-md" : "border-gray-200 hover:border-gray-300"
                                        )}
                                        style={paymentMethod === 'pix' ? { borderColor: primaryColor } : {}}
                                        onClick={() => setPaymentMethod('pix')}
                                    >
                                        <RadioGroupItem value="pix" id="pix" />
                                        <Label htmlFor="pix" className="flex-1 cursor-pointer font-semibold">
                                            PIX
                                            <p className="text-sm text-gray-500 font-normal">Chave enviada no WhatsApp</p>
                                        </Label>
                                    </div>

                                    <div
                                        className={cn(
                                            "flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                                            paymentMethod === 'card_machine' ? "border-current shadow-md" : "border-gray-200 hover:border-gray-300"
                                        )}
                                        style={paymentMethod === 'card_machine' ? { borderColor: primaryColor } : {}}
                                        onClick={() => setPaymentMethod('card_machine')}
                                    >
                                        <RadioGroupItem value="card_machine" id="card" />
                                        <Label htmlFor="card" className="flex-1 cursor-pointer font-semibold">
                                            Cartão
                                            <p className="text-sm text-gray-500 font-normal">Maquininha na entrega/retirada</p>
                                        </Label>
                                    </div>

                                    <div
                                        className={cn(
                                            "flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                                            paymentMethod === 'money' ? "border-current shadow-md" : "border-gray-200 hover:border-gray-300"
                                        )}
                                        style={paymentMethod === 'money' ? { borderColor: primaryColor } : {}}
                                        onClick={() => setPaymentMethod('money')}
                                    >
                                        <RadioGroupItem value="money" id="money" />
                                        <Label htmlFor="money" className="flex-1 cursor-pointer font-semibold">
                                            Dinheiro
                                            <p className="text-sm text-gray-500 font-normal">Pagamento em espécie</p>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {paymentMethod === 'money' && (
                                    <div className="space-y-2 animate-in slide-in-from-top duration-300">
                                        <Label>Troco para quanto? (opcional)</Label>
                                        <Input
                                            type="number"
                                            value={changeFor}
                                            onChange={(e) => setChangeFor(e.target.value)}
                                            placeholder="Ex: 50"
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 4 && (
                        <Card className="animate-in slide-in-from-right duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
                                    Revisar Pedido
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Customer Info */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Seus Dados
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                                        <p><strong>Nome:</strong> {name}</p>
                                        <p><strong>Telefone:</strong> {phone}</p>
                                        {email && <p><strong>E-mail:</strong> {email}</p>}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>Editar</Button>
                                </div>

                                {/* Delivery Info */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Entrega
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                                        <p><strong>Tipo:</strong> {deliveryType === 'delivery' ? 'Entrega' : 'Retirada no Local'}</p>
                                        {deliveryType === 'delivery' && (
                                            <p><strong>Endereço:</strong> {
                                                newAddress.street
                                                    ? `${newAddress.street}, ${newAddress.number}${newAddress.complement ? `, ${newAddress.complement}` : ''}, ${newAddress.neighborhood}, ${newAddress.city}`
                                                    : addresses.find(a => a.id === selectedAddressId)?.address
                                            }</p>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>Editar</Button>
                                </div>

                                {/* Payment Info */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Pagamento
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                                        <p><strong>Método:</strong> {
                                            paymentMethod === 'pix' ? 'PIX' :
                                                paymentMethod === 'card_machine' ? 'Cartão (Maquininha)' :
                                                    'Dinheiro'
                                        }</p>
                                        {paymentMethod === 'money' && changeFor && (
                                            <p><strong>Troco para:</strong> R$ {changeFor}</p>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>Editar</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                        {currentStep > 1 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex-1"
                                size="lg"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                        )}

                        {currentStep < 4 ? (
                            <Button
                                onClick={handleNext}
                                disabled={
                                    (currentStep === 1 && !canProceedStep1) ||
                                    (currentStep === 2 && !canProceedStep2) ||
                                    (currentStep === 3 && !canProceedStep3)
                                }
                                className="flex-1 text-white"
                                size="lg"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Continuar
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 text-white"
                                size="lg"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Finalizando...
                                    </>
                                ) : (
                                    'Finalizar Pedido'
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="md:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle className="text-lg">Resumo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Items */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {items.map(item => (
                                    <div key={item.itemId} className="text-sm">
                                        <div className="flex justify-between font-semibold">
                                            <span>{item.quantity}x {item.product.name}</span>
                                            <span>R$ {item.totalPrice.toFixed(2)}</span>
                                        </div>

                                        {item.half_and_half ? (
                                            // Half and half display
                                            <div className="text-xs text-gray-600 mt-1 space-y-1">
                                                <div className="bg-orange-50 border-l-2 border-orange-300 pl-2 py-1">
                                                    <p className="font-semibold text-orange-700">🍕 Meio a Meio</p>
                                                    <p className="text-gray-700">
                                                        <strong>1ª metade - {item.half_and_half.first_half.product.name}:</strong> {item.half_and_half.first_half.options.map(o => o.option_name).join(', ') || 'Sem opções'}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        <strong>2ª metade - {item.half_and_half.second_half.product.name}:</strong> {item.half_and_half.second_half.options.map(o => o.option_name).join(', ') || 'Sem opções'}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            // Normal display
                                            item.selectedOptions && item.selectedOptions.length > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {item.selectedOptions.map(o => o.option_name).join(', ')}
                                                </p>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>R$ {cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Entrega</span>
                                    <span>{deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2)}` : 'Grátis'}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span style={{ color: primaryColor }}>R$ {finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
