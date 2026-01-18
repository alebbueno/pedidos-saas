'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Palette, Image as ImageIcon, Type, Save, X, DollarSign } from 'lucide-react'
import { updateRestaurantColors, updateRestaurantFont, updateRestaurantImages, updateHalfAndHalfPricingMethod } from '@/actions/admin'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useToast, ToastContainer } from '@/components/ui/toast'

interface CustomizationClientProps {
    restaurant: any
}

export function CustomizationClient({ restaurant }: CustomizationClientProps) {
    const { toasts, removeToast, success, error } = useToast()

    const [colors, setColors] = useState({
        primary_color: restaurant.primary_color || '#F97316',
        secondary_color: restaurant.secondary_color || '#1F2937',
        background_color: restaurant.background_color || '#FFFFFF',
        text_color: restaurant.text_color || '#000000',
    })

    const [fontFamily, setFontFamily] = useState(restaurant.font_family || 'inter')
    const [logoUrl, setLogoUrl] = useState(restaurant.logo_url || '')
    const [bannerUrl, setBannerUrl] = useState(restaurant.banner_url || '')
    const [pricingMethod, setPricingMethod] = useState<'highest' | 'average' | 'sum'>(restaurant.half_and_half_pricing_method || 'highest')

    const [isLoadingColors, setIsLoadingColors] = useState(false)
    const [isLoadingFont, setIsLoadingFont] = useState(false)
    const [isLoadingPricing, setIsLoadingPricing] = useState(false)
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [isUploadingBanner, setIsUploadingBanner] = useState(false)

    const handleColorChange = (key: string, value: string) => {
        setColors(prev => ({ ...prev, [key]: value }))
    }

    const handleSaveColors = async () => {
        setIsLoadingColors(true)
        try {
            const result = await updateRestaurantColors(restaurant.id, colors)
            if (result.error) {
                error(result.error)
            } else {
                success('Cores atualizadas com sucesso!')
            }
        } catch (err) {
            console.error(err)
            error('Erro ao salvar cores')
        } finally {
            setIsLoadingColors(false)
        }
    }

    const handleSaveFont = async () => {
        setIsLoadingFont(true)
        try {
            const result = await updateRestaurantFont(restaurant.id, fontFamily)
            if (result.error) {
                error(result.error)
            } else {
                success('Fonte atualizada com sucesso!')
            }
        } catch (err) {
            console.error(err)
            error('Erro ao salvar fonte')
        } finally {
            setIsLoadingFont(false)
        }
    }

    const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
        const supabase = createClient()
        const isLogo = type === 'logo'

        if (isLogo) setIsUploadingLogo(true)
        else setIsUploadingBanner(true)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${type}-${Date.now()}.${fileExt}`
            const filePath = `${restaurant.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('restaurants')
                .upload(filePath, file)

            if (uploadError) {
                error('Erro ao fazer upload da imagem')
                return
            }

            const { data: { publicUrl } } = supabase.storage
                .from('restaurants')
                .getPublicUrl(filePath)

            const updateData = isLogo ? { logo_url: publicUrl } : { banner_url: publicUrl }
            const result = await updateRestaurantImages(restaurant.id, updateData)

            if (result.error) {
                error(result.error)
            } else {
                if (isLogo) setLogoUrl(publicUrl)
                else setBannerUrl(publicUrl)
                success(`${isLogo ? 'Logo' : 'Banner'} atualizado com sucesso!`)
            }
        } catch (err) {
            console.error(err)
            error('Erro ao fazer upload')
        } finally {
            if (isLogo) setIsUploadingLogo(false)
            else setIsUploadingBanner(false)
        }
    }

    const handleSavePricingMethod = async () => {
        setIsLoadingPricing(true)
        try {
            const result = await updateHalfAndHalfPricingMethod(restaurant.id, pricingMethod)
            if (result.error) {
                error(result.error)
            } else {
                success('Método de cobrança atualizado com sucesso!')
            }
        } catch (err) {
            console.error(err)
            error('Erro ao salvar método de cobrança')
        } finally {
            setIsLoadingPricing(false)
        }
    }

    return (
        <>
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Settings - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Colors */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-orange-500" />
                                Cores do Tema
                            </CardTitle>
                            <CardDescription>
                                Defina as cores principais do seu cardápio digital
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="primary_color">Cor Primária</Label>
                                    <div className="flex gap-2 mt-1.5">
                                        <Input
                                            id="primary_color"
                                            type="color"
                                            value={colors.primary_color}
                                            onChange={(e) => handleColorChange('primary_color', e.target.value)}
                                            className="w-20 h-10 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={colors.primary_color}
                                            onChange={(e) => handleColorChange('primary_color', e.target.value)}
                                            placeholder="#000000"
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Usada em botões e destaques</p>
                                </div>

                                <div>
                                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                                    <div className="flex gap-2 mt-1.5">
                                        <Input
                                            id="secondary_color"
                                            type="color"
                                            value={colors.secondary_color}
                                            onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                                            className="w-20 h-10 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={colors.secondary_color}
                                            onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                                            placeholder="#000000"
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Usada em textos e ícones</p>
                                </div>

                                <div>
                                    <Label htmlFor="background_color">Cor de Fundo</Label>
                                    <div className="flex gap-2 mt-1.5">
                                        <Input
                                            id="background_color"
                                            type="color"
                                            value={colors.background_color}
                                            onChange={(e) => handleColorChange('background_color', e.target.value)}
                                            className="w-20 h-10 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={colors.background_color}
                                            onChange={(e) => handleColorChange('background_color', e.target.value)}
                                            placeholder="#FFFFFF"
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Cor de fundo do cardápio</p>
                                </div>

                                <div>
                                    <Label htmlFor="text_color">Cor do Texto</Label>
                                    <div className="flex gap-2 mt-1.5">
                                        <Input
                                            id="text_color"
                                            type="color"
                                            value={colors.text_color}
                                            onChange={(e) => handleColorChange('text_color', e.target.value)}
                                            className="w-20 h-10 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={colors.text_color}
                                            onChange={(e) => handleColorChange('text_color', e.target.value)}
                                            placeholder="#000000"
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Cor principal do texto</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-end">
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600"
                                    onClick={handleSaveColors}
                                    disabled={isLoadingColors}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isLoadingColors ? 'Salvando...' : 'Salvar Cores'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logo & Banner */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-orange-500" />
                                Logo e Banner
                            </CardTitle>
                            <CardDescription>
                                Adicione logo e imagem de capa ao cardápio
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Logo do Restaurante</Label>
                                {logoUrl ? (
                                    <div className="mt-2 relative w-48 h-48 border border-gray-200 rounded-lg overflow-hidden">
                                        <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={() => setLogoUrl('')}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer block">
                                        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">Clique para fazer upload do logo</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG ou JPG, recomendado 200x200px</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleImageUpload(file, 'logo')
                                            }}
                                            disabled={isUploadingLogo}
                                        />
                                    </label>
                                )}
                                {isUploadingLogo && <p className="text-sm text-gray-500 mt-2">Fazendo upload...</p>}
                            </div>

                            <div>
                                <Label>Banner do Cardápio</Label>
                                {bannerUrl ? (
                                    <div className="mt-2 relative w-full aspect-[3/1] border border-gray-200 rounded-lg overflow-hidden">
                                        <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={() => setBannerUrl('')}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer block">
                                        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">Clique para fazer upload do banner</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG ou JPG, recomendado 1200x400px</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleImageUpload(file, 'banner')
                                            }}
                                            disabled={isUploadingBanner}
                                        />
                                    </label>
                                )}
                                {isUploadingBanner && <p className="text-sm text-gray-500 mt-2">Fazendo upload...</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Typography */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Type className="w-5 h-5 text-orange-500" />
                                Tipografia
                            </CardTitle>
                            <CardDescription>
                                Configure as fontes do cardápio
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="font_family">Fonte Principal</Label>
                                <select
                                    id="font_family"
                                    className="w-full mt-1.5 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={fontFamily}
                                    onChange={(e) => setFontFamily(e.target.value)}
                                >
                                    <option value="inter">Inter (Moderna)</option>
                                    <option value="roboto">Roboto (Clássica)</option>
                                    <option value="poppins">Poppins (Arredondada)</option>
                                    <option value="montserrat">Montserrat (Elegante)</option>
                                    <option value="opensans">Open Sans (Limpa)</option>
                                </select>
                            </div>

                            <Separator />

                            <div className="flex justify-end">
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600"
                                    onClick={handleSaveFont}
                                    disabled={isLoadingFont}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isLoadingFont ? 'Salvando...' : 'Salvar Tipografia'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Half and Half Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-orange-500" />
                                Meio a Meio - Método de Cobrança
                            </CardTitle>
                            <CardDescription>
                                Configure como será calculado o preço de produtos meio a meio
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="pricing_method">Método de Cobrança</Label>
                                <select
                                    id="pricing_method"
                                    className="w-full mt-1.5 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={pricingMethod}
                                    onChange={(e) => setPricingMethod(e.target.value as 'highest' | 'average' | 'sum')}
                                >
                                    <option value="highest">Preço Mais Alto - Cobra o valor da metade mais cara</option>
                                    <option value="average">Preço Médio - Calcula a média dos valores</option>
                                    <option value="sum">Soma dos Preços - Soma o valor das duas metades</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    {pricingMethod === 'highest' && '✓ Recomendado: Justo para o cliente e rentável para o restaurante'}
                                    {pricingMethod === 'average' && 'Cliente paga a média entre as duas metades escolhidas'}
                                    {pricingMethod === 'sum' && 'Cliente paga o valor total das duas metades (mais caro)'}
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    <strong>Exemplo:</strong> Pizza metade Calabresa (R$ 40) + metade Mussarela (R$ 35)
                                </p>
                                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                    <li>• <strong>Preço Mais Alto:</strong> R$ 40,00</li>
                                    <li>• <strong>Preço Médio:</strong> R$ 37,50</li>
                                    <li>• <strong>Soma:</strong> R$ 75,00</li>
                                </ul>
                            </div>

                            <Separator />

                            <div className="flex justify-end">
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600"
                                    onClick={handleSavePricingMethod}
                                    disabled={isLoadingPricing}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isLoadingPricing ? 'Salvando...' : 'Salvar Configuração'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Preview Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Pré-visualização</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Banner */}
                                <div className="relative">
                                    {bannerUrl ? (
                                        <div className="relative h-24">
                                            <Image
                                                src={bannerUrl}
                                                alt="Banner"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="h-24"
                                            style={{ backgroundColor: colors.primary_color }}
                                        ></div>
                                    )}

                                    {/* Logo sobreposto */}
                                    <div className="absolute -bottom-8 left-4">
                                        <div className="w-16 h-16 bg-white rounded-full border-4 border-white overflow-hidden shadow-lg">
                                            {logoUrl ? (
                                                <Image src={logoUrl} alt="Logo" width={64} height={64} className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 pt-12" style={{ backgroundColor: colors.background_color }}>
                                    <h3 className="font-bold text-lg" style={{ color: colors.text_color }}>
                                        {restaurant.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Cardápio Digital</p>
                                    <Button
                                        className="w-full mt-4 text-white"
                                        style={{ backgroundColor: colors.primary_color }}
                                    >
                                        Ver Produtos
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                Prévia aproximada do cardápio
                            </p>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Ações Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                size="sm"
                                onClick={() => {
                                    setColors({
                                        primary_color: '#F97316',
                                        secondary_color: '#1F2937',
                                        background_color: '#FFFFFF',
                                        text_color: '#000000',
                                    })
                                    setFontFamily('inter')
                                }}
                            >
                                Restaurar Padrão
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                size="sm"
                                onClick={() => window.open(`/lp/${restaurant.slug}`, '_blank')}
                            >
                                Visualizar Cardápio
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
