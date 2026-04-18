'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Package, Upload, Lightbulb, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { IMaskInput } from 'react-imask'

interface Step6Props {
    data: {
        name: string
        description: string
        basePrice: string
        imageUrl: string
    }
    onChange: (data: any) => void
    categoryName: string
}

export function Step6FirstProduct({ data, onChange, categoryName }: Step6Props) {
    const [imagePreview, setImagePreview] = useState<string>(data.imageUrl || '')

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                setImagePreview(result)
                onChange({ ...data, imageUrl: result })
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <Package className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Primeiro Produto</h2>
                <p className="text-slate-600 text-lg">
                    Adicione seu primeiro produto na categoria <span className="font-semibold text-orange-600">{categoryName || 'criada'}</span>
                </p>
            </div>

            {/* Tip Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                    <strong>Dica:</strong> Adicione seu produto mais vendido primeiro para testar o sistema.
                    Você pode pular esta etapa e adicionar produtos depois!
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
                {/* Product Image */}
                <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Imagem do Produto (opcional)</Label>

                    <div className="flex items-start gap-4">
                        {/* Preview */}
                        <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden flex-shrink-0">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Product preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-slate-400" />
                            )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex-1">
                            <label
                                htmlFor="product-image-upload"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                                <Upload className="w-5 h-5" />
                                Escolher imagem
                            </label>
                            <input
                                id="product-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <p className="text-sm text-slate-500 mt-2">
                                Produtos com foto vendem até 3x mais!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Product Name */}
                <div className="space-y-2">
                    <Label htmlFor="product-name" className="text-slate-700 font-medium">
                        Nome do Produto *
                    </Label>
                    <Input
                        id="product-name"
                        placeholder="Ex: Camiseta algodão orgânico, Kit sabonetes, Marmita fit"
                        value={data.name}
                        onChange={(e) => onChange({ ...data, name: e.target.value })}
                        className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                </div>

                {/* Product Description */}
                <div className="space-y-2">
                    <Label htmlFor="product-description" className="text-slate-700 font-medium">
                        Descrição
                    </Label>
                    <Textarea
                        id="product-description"
                        placeholder="Ex: Tamanhos disponíveis, materiais, prazo de produção ou validade"
                        value={data.description}
                        onChange={(e) => onChange({ ...data, description: e.target.value })}
                        className="rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500 min-h-[100px]"
                    />
                    <p className="text-sm text-slate-500">
                        Destaque o que o cliente precisa saber antes de comprar
                    </p>
                </div>

                {/* Product Price */}
                <div className="space-y-2">
                    <Label htmlFor="product-price" className="text-slate-700 font-medium">
                        Preço *
                    </Label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-lg">
                            R$
                        </span>
                        <IMaskInput
                            id="product-price"
                            mask={Number}
                            radix=","
                            scale={2}
                            thousandsSeparator="."
                            mapToRadix={['.']}
                            normalizeZeros
                            min={0}
                            max={99_999_999.99}
                            value={data.basePrice}
                            onAccept={(value) => onChange({ ...data, basePrice: value })}
                            placeholder="0,00"
                            inputMode="decimal"
                            className="flex h-14 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pl-12 text-lg font-semibold ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                        />
                    </div>
                </div>
            </div>

            {/* Product Preview Card */}
            <div className="space-y-3">
                <Label className="text-slate-700 font-medium">Prévia do Produto:</Label>
                <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {imagePreview && (
                        <div className="aspect-video w-full bg-slate-100 overflow-hidden">
                            <img src={imagePreview} alt="Product" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="p-5">
                        <h3 className="font-bold text-lg text-slate-900 mb-2">
                            {data.name || 'Nome do Produto'}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                            {data.description || 'Descrição do produto aparecerá aqui...'}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-orange-600">
                                R$&nbsp;{data.basePrice.trim() ? data.basePrice : '0,00'}
                            </span>
                            <button className="px-6 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors">
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Example Card */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3">📦 Exemplo de produto:</h3>
                <div className="space-y-2 text-sm text-slate-700">
                    <p><strong>Nome:</strong> Ecobag edição limitada</p>
                    <p><strong>Descrição:</strong> Algodão cru, alças reforçadas, estampa exclusiva da coleção</p>
                    <p><strong>Preço:</strong> R$ 45,00</p>
                </div>
                <div className="mt-4 p-3 bg-white rounded-xl border border-red-200">
                    <p className="text-xs text-slate-600">
                        💡 <strong>Lembre-se:</strong> Você pode adicionar variações (tamanho, cor, complementos)
                        para este produto depois no painel de controle!
                    </p>
                </div>
            </div>
        </div>
    )
}
