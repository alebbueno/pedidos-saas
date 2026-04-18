'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FolderOpen, Lightbulb } from 'lucide-react'

interface Step5Props {
    data: {
        name: string
        description: string
    }
    onChange: (data: any) => void
}

export function Step5MenuCategory({ data, onChange }: Step5Props) {
    const exampleCategories = [
        { name: 'Destaques', icon: '✨', description: 'O que você mais quer vender primeiro' },
        { name: 'Novidades', icon: '🆕', description: 'Lançamentos e coleções atuais' },
        { name: 'Vestuário', icon: '👕', description: 'Peças, tamanhos e cores' },
        { name: 'Acessórios', icon: '👜', description: 'Complementos e kits' },
        { name: 'Para casa', icon: '🏠', description: 'Itens de decoração e uso diário' },
        { name: 'Promoções', icon: '🏷️', description: 'Ofertas por tempo limitado' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
                    <FolderOpen className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Primeira categoria do catálogo</h2>
                <p className="text-slate-600 text-lg">Organize seus produtos em categorias para facilitar a navegação</p>
            </div>

            {/* Tip Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                    <strong>Dica:</strong> Comece com sua categoria mais popular. Você pode adicionar mais categorias
                    depois no painel de controle!
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
                {/* Category Name */}
                <div className="space-y-2">
                    <Label htmlFor="category-name" className="text-slate-700 font-medium">
                        Nome da Categoria *
                    </Label>
                    <Input
                        id="category-name"
                        placeholder="Ex: Novidades, Best-sellers, Verão 2026"
                        value={data.name}
                        onChange={(e) => onChange({ ...data, name: e.target.value })}
                        className="h-12 rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                </div>

                {/* Category Description */}
                <div className="space-y-2">
                    <Label htmlFor="category-description" className="text-slate-700 font-medium">
                        Descrição (opcional)
                    </Label>
                    <Textarea
                        id="category-description"
                        placeholder="Ex: Peças da coleção atual com envio em até 3 dias úteis"
                        value={data.description}
                        onChange={(e) => onChange({ ...data, description: e.target.value })}
                        className="rounded-xl border-slate-300 focus:border-orange-500 focus:ring-orange-500 min-h-[80px]"
                    />
                    <p className="text-sm text-slate-500">
                        Uma breve descrição ajuda os clientes a entenderem o que encontrarão nesta categoria
                    </p>
                </div>
            </div>

            {/* Example Categories */}
            <div className="space-y-3">
                <Label className="text-slate-700 font-medium">Sugestões de categorias populares:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {exampleCategories.map((category) => (
                        <button
                            key={category.name}
                            onClick={() => onChange({ name: category.name, description: category.description })}
                            className="p-4 rounded-xl border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all text-left group"
                        >
                            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                {category.icon}
                            </div>
                            <p className="font-semibold text-slate-900 text-sm">{category.name}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Example Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3">📋 Exemplo de categoria:</h3>
                <div className="bg-white rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-start gap-3">
                        <span className="text-3xl">✨</span>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 mb-1">Destaques</h4>
                            <p className="text-sm text-slate-600">
                                Curadoria do que está em alta: pronta entrega, edição limitada ou frete promocional — você escolhe o foco.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-xl border border-yellow-200">
                    <p className="text-xs text-slate-600">
                        💡 <strong>Dica profissional:</strong> Organize as categorias por ordem de popularidade.
                        O que vende mais pode aparecer primeiro no catálogo!
                    </p>
                </div>
            </div>
        </div>
    )
}
