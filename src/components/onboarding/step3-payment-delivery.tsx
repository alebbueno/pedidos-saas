'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { CreditCard, Truck, Lightbulb } from 'lucide-react'

interface Step3Props {
    data: {
        paymentMethods: {
            cash: boolean
            pix: boolean
            credit: boolean
            debit: boolean
            voucher: boolean
        }
        deliveryFee: string
        minimumOrderValue: string
    }
    onChange: (data: any) => void
}

export function Step3PaymentDelivery({ data, onChange }: Step3Props) {
    const paymentOptions = [
        { id: 'cash', label: 'Dinheiro', icon: '💵' },
        { id: 'pix', label: 'PIX', icon: '📱' },
        { id: 'credit', label: 'Cartão de Crédito', icon: '💳' },
        { id: 'debit', label: 'Cartão de Débito', icon: '💳' },
        { id: 'voucher', label: 'Vale Refeição', icon: '🎫' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Pagamento e Entrega</h2>
                <p className="text-slate-600 text-lg">Configure as formas de pagamento e taxas de entrega</p>
            </div>

            {/* Tip Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                    <strong>Dica:</strong> Aceitar múltiplas formas de pagamento aumenta suas vendas em até 40%!
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                {/* Payment Methods */}
                <div className="space-y-4">
                    <Label className="text-slate-700 font-medium text-lg">
                        Formas de Pagamento Aceitas *
                    </Label>

                    <div className="grid md:grid-cols-2 gap-4">
                        {paymentOptions.map((option) => (
                            <div
                                key={option.id}
                                className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-orange-300 transition-colors cursor-pointer"
                                onClick={() => {
                                    onChange({
                                        ...data,
                                        paymentMethods: {
                                            ...data.paymentMethods,
                                            [option.id]: !data.paymentMethods[option.id as keyof typeof data.paymentMethods]
                                        }
                                    })
                                }}
                            >
                                <Checkbox
                                    id={option.id}
                                    checked={data.paymentMethods[option.id as keyof typeof data.paymentMethods]}
                                    onCheckedChange={(checked) => {
                                        onChange({
                                            ...data,
                                            paymentMethods: {
                                                ...data.paymentMethods,
                                                [option.id]: checked
                                            }
                                        })
                                    }}
                                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                />
                                <span className="text-2xl">{option.icon}</span>
                                <Label htmlFor={option.id} className="flex-1 cursor-pointer font-medium text-slate-700">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Settings */}
                <div className="space-y-4 pt-4 border-t-2 border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-6 h-6 text-orange-600" />
                        <Label className="text-slate-700 font-medium text-lg">
                            Configurações de Entrega
                        </Label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Delivery Fee */}
                        <div className="space-y-2">
                            <Label htmlFor="delivery-fee" className="text-slate-700 font-medium">
                                Taxa de Entrega
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                                    R$
                                </span>
                                <Input
                                    id="delivery-fee"
                                    type="number"
                                    step="0.01"
                                    placeholder="5.00"
                                    value={data.deliveryFee}
                                    onChange={(e) => onChange({ ...data, deliveryFee: e.target.value })}
                                    className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500 pl-10"
                                />
                            </div>
                            <p className="text-sm text-slate-500">
                                Valor cobrado por entrega
                            </p>
                        </div>

                        {/* Minimum Order Value */}
                        <div className="space-y-2">
                            <Label htmlFor="minimum-order" className="text-slate-700 font-medium">
                                Pedido Mínimo (opcional)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                                    R$
                                </span>
                                <Input
                                    id="minimum-order"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.minimumOrderValue}
                                    onChange={(e) => onChange({ ...data, minimumOrderValue: e.target.value })}
                                    className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500 pl-10"
                                />
                            </div>
                            <p className="text-sm text-slate-500">
                                Valor mínimo para aceitar pedidos
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Example Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3">💡 Exemplo de configuração:</h3>
                <div className="space-y-2 text-sm text-slate-700">
                    <p><strong>Formas de pagamento:</strong> Dinheiro, PIX, Cartão de Crédito e Débito</p>
                    <p><strong>Taxa de entrega:</strong> R$ 5,00</p>
                    <p><strong>Pedido mínimo:</strong> R$ 20,00</p>
                </div>
                <div className="mt-4 p-3 bg-white rounded-xl border border-green-200">
                    <p className="text-xs text-slate-600">
                        ℹ️ <strong>Dica profissional:</strong> Oferecer frete grátis acima de um valor (ex: R$ 50)
                        pode aumentar o ticket médio dos seus pedidos!
                    </p>
                </div>
            </div>
        </div>
    )
}
