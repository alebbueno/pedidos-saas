'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Palette, Upload, Lightbulb, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

interface Step2Props {
    data: {
        logoUrl: string
        primaryColor: string
        secondaryColor: string
    }
    onChange: (data: any) => void
}

export function Step2Customization({ data, onChange }: Step2Props) {
    const [logoPreview, setLogoPreview] = useState<string>(data.logoUrl || '')

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                setLogoPreview(result)
                onChange({ ...data, logoUrl: result })
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                    <Palette className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Personalização</h2>
                <p className="text-slate-600 text-lg">Deixe seu cardápio com a cara do seu negócio</p>
            </div>

            {/* Tip Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                    <strong>Dica:</strong> Use cores que combinem com sua marca. Você pode mudar isso depois a qualquer momento!
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Logo do Restaurante</Label>

                    <div className="flex items-start gap-4">
                        {/* Preview */}
                        <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-slate-400" />
                            )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex-1">
                            <label
                                htmlFor="logo-upload"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                                <Upload className="w-5 h-5" />
                                Escolher imagem
                            </label>
                            <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                            <p className="text-sm text-slate-500 mt-2">
                                Formatos aceitos: JPG, PNG, SVG (máx. 2MB)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Color Pickers */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Primary Color */}
                    <div className="space-y-3">
                        <Label htmlFor="primary-color" className="text-slate-700 font-medium">
                            Cor Principal
                        </Label>
                        <div className="flex items-center gap-3">
                            <input
                                id="primary-color"
                                type="color"
                                value={data.primaryColor}
                                onChange={(e) => onChange({ ...data, primaryColor: e.target.value })}
                                className="w-16 h-16 rounded-xl border-2 border-slate-300 cursor-pointer"
                            />
                            <Input
                                value={data.primaryColor}
                                onChange={(e) => onChange({ ...data, primaryColor: e.target.value })}
                                className="flex-1 h-12 rounded-xl border-slate-300 font-mono uppercase"
                                placeholder="#FF3B30"
                            />
                        </div>
                        <p className="text-sm text-slate-500">
                            Usada em botões e destaques
                        </p>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-3">
                        <Label htmlFor="secondary-color" className="text-slate-700 font-medium">
                            Cor Secundária
                        </Label>
                        <div className="flex items-center gap-3">
                            <input
                                id="secondary-color"
                                type="color"
                                value={data.secondaryColor}
                                onChange={(e) => onChange({ ...data, secondaryColor: e.target.value })}
                                className="w-16 h-16 rounded-xl border-2 border-slate-300 cursor-pointer"
                            />
                            <Input
                                value={data.secondaryColor}
                                onChange={(e) => onChange({ ...data, secondaryColor: e.target.value })}
                                className="flex-1 h-12 rounded-xl border-slate-300 font-mono uppercase"
                                placeholder="#FF9500"
                            />
                        </div>
                        <p className="text-sm text-slate-500">
                            Usada em elementos complementares
                        </p>
                    </div>
                </div>

                {/* Preview Card */}
                <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Prévia do Cardápio</Label>
                    <div
                        className="rounded-2xl p-6 border-2 border-slate-200"
                        style={{ backgroundColor: `${data.primaryColor}10` }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            {logoPreview && (
                                <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-cover" />
                            )}
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Seu Restaurante</h3>
                                <p className="text-sm text-slate-600">Cardápio Digital</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <button
                                className="w-full py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105"
                                style={{ backgroundColor: data.primaryColor }}
                            >
                                Botão Principal
                            </button>
                            <button
                                className="w-full py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105"
                                style={{ backgroundColor: data.secondaryColor }}
                            >
                                Botão Secundário
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Example Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3">🎨 Sugestões de cores:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => onChange({ ...data, primaryColor: '#FF3B30', secondaryColor: '#FF9500' })}
                        className="p-3 rounded-xl border-2 border-slate-200 hover:border-orange-500 transition-colors"
                    >
                        <div className="flex gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#FF3B30]" />
                            <div className="w-8 h-8 rounded-lg bg-[#FF9500]" />
                        </div>
                        <p className="text-xs font-medium">Laranja</p>
                    </button>
                    <button
                        onClick={() => onChange({ ...data, primaryColor: '#FF2D55', secondaryColor: '#FF6482' })}
                        className="p-3 rounded-xl border-2 border-slate-200 hover:border-pink-500 transition-colors"
                    >
                        <div className="flex gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#FF2D55]" />
                            <div className="w-8 h-8 rounded-lg bg-[#FF6482]" />
                        </div>
                        <p className="text-xs font-medium">Rosa</p>
                    </button>
                    <button
                        onClick={() => onChange({ ...data, primaryColor: '#007AFF', secondaryColor: '#5AC8FA' })}
                        className="p-3 rounded-xl border-2 border-slate-200 hover:border-blue-500 transition-colors"
                    >
                        <div className="flex gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#007AFF]" />
                            <div className="w-8 h-8 rounded-lg bg-[#5AC8FA]" />
                        </div>
                        <p className="text-xs font-medium">Azul</p>
                    </button>
                    <button
                        onClick={() => onChange({ ...data, primaryColor: '#34C759', secondaryColor: '#30D158' })}
                        className="p-3 rounded-xl border-2 border-slate-200 hover:border-green-500 transition-colors"
                    >
                        <div className="flex gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#34C759]" />
                            <div className="w-8 h-8 rounded-lg bg-[#30D158]" />
                        </div>
                        <p className="text-xs font-medium">Verde</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
