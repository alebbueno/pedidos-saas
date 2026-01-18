'use client'

import { Restaurant } from '@/types'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Store, Clock, Phone, Mail, MapPin, Globe, Save, Loader2, Check } from 'lucide-react'
import {
    updateRestaurantInfo,
    updateDeliveryFee,
    updatePaymentMethods,
    updateOpeningHours,
    updateStoreStatus
} from '@/actions/settings'
import { useRouter } from 'next/navigation'

export default function SettingsClient({ restaurant }: { restaurant: Restaurant }) {
    const router = useRouter()

    // General Info State
    const [name, setName] = useState(restaurant.name)
    const [description, setDescription] = useState(restaurant.description || '')
    const [phone, setPhone] = useState(restaurant.phone || '')
    const [email, setEmail] = useState(restaurant.email || '')
    const [address, setAddress] = useState(restaurant.address || '')

    // Delivery & Payment State
    const [deliveryFee, setDeliveryFee] = useState(restaurant.delivery_fee.toString())
    const [paymentMethods, setPaymentMethods] = useState(restaurant.payment_methods || {
        cash: true,
        credit: true,
        debit: true,
        pix: true,
        voucher: false
    })

    // Opening Hours State
    const [openingHours, setOpeningHours] = useState(restaurant.opening_hours || {
        monday: { open: '09:00', close: '22:00', enabled: true },
        tuesday: { open: '09:00', close: '22:00', enabled: true },
        wednesday: { open: '09:00', close: '22:00', enabled: true },
        thursday: { open: '09:00', close: '22:00', enabled: true },
        friday: { open: '09:00', close: '22:00', enabled: true },
        saturday: { open: '09:00', close: '22:00', enabled: true },
        sunday: { open: '09:00', close: '22:00', enabled: true }
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

    const handleSaveInfo = async () => {
        setIsSavingInfo(true)
        const result = await updateRestaurantInfo(restaurant.id, {
            name,
            description,
            phone,
            email,
            address
        })

        if (result.success) {
            setInfoSaved(true)
            setTimeout(() => setInfoSaved(false), 2000)
            router.refresh()
        } else {
            alert('Erro ao salvar informações: ' + result.error)
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
            router.refresh()
        } else {
            alert('Erro ao salvar configurações de entrega/pagamento')
        }
        setIsSavingDelivery(false)
    }

    const handleSaveHours = async () => {
        setIsSavingHours(true)
        const result = await updateOpeningHours(restaurant.id, openingHours)

        if (result.success) {
            setHoursSaved(true)
            setTimeout(() => setHoursSaved(false), 2000)
            router.refresh()
        } else {
            alert('Erro ao salvar horários: ' + result.error)
        }
        setIsSavingHours(false)
    }

    const handleToggleStatus = async (checked: boolean) => {
        setIsSavingStatus(true)
        setIsOpen(checked)

        const result = await updateStoreStatus(restaurant.id, checked)

        if (!result.success) {
            alert('Erro ao atualizar status: ' + result.error)
            setIsOpen(!checked) // Rollback
        } else {
            router.refresh()
        }
        setIsSavingStatus(false)
    }

    const daysMap = [
        { day: 'Segunda-feira', key: 'monday' },
        { day: 'Terça-feira', key: 'tuesday' },
        { day: 'Quarta-feira', key: 'wednesday' },
        { day: 'Quinta-feira', key: 'thursday' },
        { day: 'Sexta-feira', key: 'friday' },
        { day: 'Sábado', key: 'saturday' },
        { day: 'Domingo', key: 'sunday' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Configurações</h1>
                <p className="text-gray-500 mt-1">Gerencie as configurações do seu restaurante</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Settings - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Restaurant Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="w-5 h-5 text-orange-500" />
                                Informações do Restaurante
                            </CardTitle>
                            <CardDescription>
                                Dados básicos que aparecem no cardápio público
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Label htmlFor="name">Nome do Restaurante</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Pizzaria do João"
                                        className="mt-1.5"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="description">Descrição</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Descreva seu restaurante..."
                                        className="mt-1.5 min-h-[100px]"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Telefone</Label>
                                    <div className="relative mt-1.5">
                                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="(11) 99999-9999"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative mt-1.5">
                                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="contato@restaurante.com"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="address">Endereço</Label>
                                    <div className="relative mt-1.5">
                                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Rua, número, bairro, cidade"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSaveInfo}
                                    disabled={isSavingInfo}
                                    className="bg-orange-500 hover:bg-orange-600"
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="w-5 h-5 text-orange-500" />
                                Entrega e Pagamento
                            </CardTitle>
                            <CardDescription>
                                Configure taxas de entrega e formas de pagamento aceitas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
                                <Input
                                    id="delivery_fee"
                                    type="number"
                                    step="0.01"
                                    value={deliveryFee}
                                    onChange={(e) => setDeliveryFee(e.target.value)}
                                    placeholder="0.00"
                                    className="mt-1.5"
                                />
                                <p className="text-xs text-gray-500 mt-1">Valor cobrado por entrega</p>
                            </div>

                            <Separator />

                            <div>
                                <Label className="mb-3 block">Formas de Pagamento Aceitas</Label>
                                <div className="space-y-2">
                                    {[
                                        { key: 'cash', label: 'Dinheiro', desc: 'Pagamento em espécie', emoji: '💵', color: 'green' },
                                        { key: 'credit', label: 'Cartão de Crédito', desc: 'Visa, Mastercard, Elo', emoji: '💳', color: 'blue' },
                                        { key: 'debit', label: 'Cartão de Débito', desc: 'Todas as bandeiras', emoji: '💳', color: 'purple' },
                                        { key: 'pix', label: 'PIX', desc: 'Pagamento instantâneo', emoji: '📱', color: 'orange' },
                                        { key: 'voucher', label: 'Vale Refeição', desc: 'Sodexo, Alelo, VR', emoji: '🎫', color: 'yellow' },
                                    ].map((method) => (
                                        <div key={method.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 bg-${method.color}-100 rounded-lg flex items-center justify-center`}>
                                                    <span className="text-lg">{method.emoji}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{method.label}</p>
                                                    <p className="text-xs text-gray-500">{method.desc}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={paymentMethods[method.key as keyof typeof paymentMethods] || false}
                                                onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, [method.key]: checked })}
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
                                    className="bg-orange-500 hover:bg-orange-600"
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-500" />
                                Horário de Funcionamento
                            </CardTitle>
                            <CardDescription>
                                Configure os horários de abertura e fechamento
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {daysMap.map((item) => (
                                <div key={item.key} className="flex items-center gap-4 py-2">
                                    <div className="w-32 font-medium text-sm">{item.day}</div>
                                    <div className="flex items-center gap-2 flex-1">
                                        <Input
                                            type="time"
                                            value={openingHours[item.key]?.open || '09:00'}
                                            onChange={(e) => setOpeningHours({
                                                ...openingHours,
                                                [item.key]: { ...openingHours[item.key], open: e.target.value }
                                            })}
                                            className="w-32"
                                        />
                                        <span className="text-gray-400">até</span>
                                        <Input
                                            type="time"
                                            value={openingHours[item.key]?.close || '22:00'}
                                            onChange={(e) => setOpeningHours({
                                                ...openingHours,
                                                [item.key]: { ...openingHours[item.key], close: e.target.value }
                                            })}
                                            className="w-32"
                                        />
                                    </div>
                                    <Switch
                                        checked={openingHours[item.key]?.enabled || false}
                                        onCheckedChange={(checked) => setOpeningHours({
                                            ...openingHours,
                                            [item.key]: { ...openingHours[item.key], enabled: checked }
                                        })}
                                    />
                                </div>
                            ))}

                            <Separator />

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSaveHours}
                                    disabled={isSavingHours}
                                    className="bg-orange-500 hover:bg-orange-600"
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status da Loja</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Loja Aberta</p>
                                    <p className="text-xs text-gray-500">Aceitar novos pedidos</p>
                                </div>
                                <Switch
                                    checked={isOpen}
                                    onCheckedChange={handleToggleStatus}
                                    disabled={isSavingStatus}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">URL do Cardápio</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                                        /lp/{restaurant.slug}
                                    </code>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Estatísticas Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Produtos Ativos</span>
                                <span className="font-bold">--</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Categorias</span>
                                <span className="font-bold">--</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Pedidos Hoje</span>
                                <span className="font-bold">--</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 bg-red-50/30">
                        <CardHeader>
                            <CardTitle className="text-base text-red-700">Zona de Perigo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-3">
                                Ações irreversíveis que afetam sua conta
                            </p>
                            <Button variant="destructive" className="w-full" size="sm">
                                Excluir Restaurante
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
