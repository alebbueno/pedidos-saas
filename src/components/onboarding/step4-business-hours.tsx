'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Clock, Lightbulb, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Step4Props {
    data: {
        [key: string]: {
            open: string
            close: string
            enabled: boolean
        }
    }
    onChange: (data: any) => void
}

export function Step4BusinessHours({ data, onChange }: Step4Props) {
    const daysOfWeek = [
        { id: 'monday', label: 'Segunda-feira', short: 'Seg' },
        { id: 'tuesday', label: 'Terça-feira', short: 'Ter' },
        { id: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
        { id: 'thursday', label: 'Quinta-feira', short: 'Qui' },
        { id: 'friday', label: 'Sexta-feira', short: 'Sex' },
        { id: 'saturday', label: 'Sábado', short: 'Sáb' },
        { id: 'sunday', label: 'Domingo', short: 'Dom' },
    ]

    const copyToAllDays = () => {
        const mondayHours = data.monday
        const newData = { ...data }
        daysOfWeek.forEach(day => {
            newData[day.id] = { ...mondayHours }
        })
        onChange(newData)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Horário de Atendimento</h2>
                <p className="text-slate-600 text-lg">Defina quando seu restaurante estará aberto para pedidos</p>
            </div>

            {/* Tip Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                    <strong>Dica:</strong> Configure os horários corretamente para evitar pedidos fora do expediente.
                    Você pode alterar isso depois a qualquer momento!
                </p>
            </div>

            {/* Quick Action */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToAllDays}
                    className="rounded-full border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Segunda para todos os dias
                </Button>
            </div>

            {/* Days Schedule */}
            <div className="space-y-3">
                {daysOfWeek.map((day) => (
                    <div
                        key={day.id}
                        className={`p-4 rounded-xl border-2 transition-all ${data[day.id]?.enabled
                                ? 'border-orange-200 bg-orange-50/30'
                                : 'border-slate-200 bg-slate-50/30'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            {/* Day Toggle */}
                            <div className="flex items-center gap-3 min-w-[180px]">
                                <Switch
                                    id={`${day.id}-enabled`}
                                    checked={data[day.id]?.enabled || false}
                                    onCheckedChange={(checked) => {
                                        onChange({
                                            ...data,
                                            [day.id]: {
                                                ...data[day.id],
                                                enabled: checked
                                            }
                                        })
                                    }}
                                    className="data-[state=checked]:bg-orange-500"
                                />
                                <Label
                                    htmlFor={`${day.id}-enabled`}
                                    className="font-medium text-slate-700 cursor-pointer"
                                >
                                    {day.label}
                                </Label>
                            </div>

                            {/* Time Inputs */}
                            {data[day.id]?.enabled && (
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex-1">
                                        <Label htmlFor={`${day.id}-open`} className="text-xs text-slate-600 mb-1">
                                            Abertura
                                        </Label>
                                        <Input
                                            id={`${day.id}-open`}
                                            type="time"
                                            value={data[day.id]?.open || '09:00'}
                                            onChange={(e) => {
                                                onChange({
                                                    ...data,
                                                    [day.id]: {
                                                        ...data[day.id],
                                                        open: e.target.value
                                                    }
                                                })
                                            }}
                                            className="h-10 rounded-lg border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>

                                    <span className="text-slate-400 font-medium mt-5">até</span>

                                    <div className="flex-1">
                                        <Label htmlFor={`${day.id}-close`} className="text-xs text-slate-600 mb-1">
                                            Fechamento
                                        </Label>
                                        <Input
                                            id={`${day.id}-close`}
                                            type="time"
                                            value={data[day.id]?.close || '22:00'}
                                            onChange={(e) => {
                                                onChange({
                                                    ...data,
                                                    [day.id]: {
                                                        ...data[day.id],
                                                        close: e.target.value
                                                    }
                                                })
                                            }}
                                            className="h-10 rounded-lg border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {!data[day.id]?.enabled && (
                                <span className="text-slate-400 text-sm italic">Fechado</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Example Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3">⏰ Exemplo de horários:</h3>
                <div className="space-y-2 text-sm text-slate-700">
                    <p><strong>Seg-Sex:</strong> 11:00 - 23:00 (Aberto)</p>
                    <p><strong>Sábado:</strong> 11:00 - 00:00 (Aberto)</p>
                    <p><strong>Domingo:</strong> 11:00 - 22:00 (Aberto)</p>
                </div>
                <div className="mt-4 p-3 bg-white rounded-xl border border-blue-200">
                    <p className="text-xs text-slate-600">
                        💡 <strong>Lembre-se:</strong> Clientes só poderão fazer pedidos durante os horários configurados.
                        Você pode pausar temporariamente os pedidos no painel de controle.
                    </p>
                </div>
            </div>
        </div>
    )
}
