'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
    Plus,
    Trash,
    X,
    Upload,
    Save,
    AlertCircle
} from 'lucide-react'
import { upsertProduct, deleteProduct } from '@/actions/admin'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import Image from 'next/image'

interface ProductFormProps {
    restaurantId: string
    product?: Product & { product_option_groups?: any[] }
    categories?: { id: string, name: string }[]
    onSuccess?: () => void
    onOpenCategoryDialog?: () => void
}

export function ProductForm({ restaurantId, product, categories, onSuccess, onOpenCategoryDialog }: ProductFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null)

    const form = useForm({
        defaultValues: {
            id: product?.id,
            name: product?.name || '',
            description: product?.description || '',
            base_price: product?.base_price || 0,
            image_url: product?.image_url || '',
            category_id: product?.category_id || '',
            is_active: product?.is_active ?? true,
            allows_half_and_half: product?.allows_half_and_half ?? false,
            option_groups: product?.product_option_groups?.map(g => ({
                ...g,
                options: g.product_options || []
            })) || []
        }
    })

    const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
        control: form.control,
        name: 'option_groups'
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setImageFile(null)
        setImagePreview(null)
        form.setValue('image_url', '')
    }

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        try {
            let imageUrl = data.image_url

            // Upload image if new file selected
            if (imageFile) {
                const supabase = createClient()
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${Date.now()}.${fileExt}`
                const filePath = `${restaurantId}/${fileName}`

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, imageFile)

                if (uploadError) {
                    alert('Erro ao fazer upload da imagem')
                    setIsLoading(false)
                    return
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath)

                imageUrl = publicUrl
            }

            const productData = {
                ...data,
                restaurant_id: restaurantId,
                base_price: Number(data.base_price),
                image_url: imageUrl
            }

            const result = await upsertProduct(productData)

            if (result.error) {
                alert('Erro ao salvar produto')
            } else {
                if (onSuccess) onSuccess()
            }
        } catch (error) {
            console.error(error)
            alert('Erro inesperado')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!product?.id) return
        setIsLoading(true)
        try {
            await deleteProduct(product.id)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
            alert('Erro ao excluir produto')
        } finally {
            setIsLoading(false)
            setIsDeleteConfirmOpen(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
                <p className="text-sm text-gray-500 mt-1">
                    {product ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
                </p>
            </div>

            {/* Form Content */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nome do Produto *</Label>
                            <Input
                                id="name"
                                {...form.register('name', { required: true })}
                                placeholder="Ex: Pizza Grande Calabresa"
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                {...form.register('description')}
                                placeholder="Descreva os ingredientes e detalhes..."
                                className="mt-1.5 min-h-[80px]"
                            />
                        </div>

                        <div>
                            <Label htmlFor="base_price">Preço Base (R$) *</Label>
                            <Input
                                id="base_price"
                                type="number"
                                step="0.01"
                                {...form.register('base_price', { required: true, valueAsNumber: true })}
                                placeholder="0.00"
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Category & Status */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="category">Categoria</Label>
                            <Select
                                value={form.watch('category_id')}
                                onValueChange={(value) => form.setValue('category_id', value)}
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {onOpenCategoryDialog && (
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="mt-1 px-0 h-auto text-orange-600 hover:text-orange-700"
                                    onClick={onOpenCategoryDialog}
                                >
                                    + Nova Categoria
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="is_active">Produto Ativo</Label>
                                <p className="text-xs text-gray-500 mt-0.5">Visível no cardápio</p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={form.watch('is_active')}
                                onCheckedChange={(checked) => form.setValue('is_active', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="allows_half_and_half">Permite Meio a Meio</Label>
                                <p className="text-xs text-gray-500 mt-0.5">Cliente pode escolher duas metades diferentes</p>
                            </div>
                            <Switch
                                id="allows_half_and_half"
                                checked={form.watch('allows_half_and_half')}
                                onCheckedChange={(checked) => form.setValue('allows_half_and_half', checked)}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Image Upload */}
                    <div>
                        <Label>Imagem do Produto</Label>
                        <div className="mt-2">
                            {imagePreview ? (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8"
                                        onClick={handleRemoveImage}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">Clique para fazer upload</span>
                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Variation Groups */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <Label>Variações e Adicionais</Label>
                                <p className="text-xs text-gray-500 mt-0.5">Configure tamanhos, bordas, adicionais, etc.</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendGroup({
                                    name: '',
                                    is_required: false,
                                    min_selections: 0,
                                    max_selections: 1,
                                    options: []
                                })}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar Grupo
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {groupFields.map((group, groupIndex) => (
                                <VariationGroup
                                    key={group.id}
                                    groupIndex={groupIndex}
                                    form={form}
                                    onRemove={() => removeGroup(groupIndex)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </form>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                <div className="flex gap-3">
                    {product?.id && (
                        <Button
                            type="button"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => setIsDeleteConfirmOpen(true)}
                            disabled={isLoading}
                        >
                            <Trash className="w-4 h-4 mr-2" />
                            Excluir
                        </Button>
                    )}
                    <Button
                        type="submit"
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                        disabled={isLoading}
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Salvando...' : 'Salvar Produto'}
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Produto?</DialogTitle>
                        <DialogDescription>
                            Esta ação não pode ser desfeita. O produto será removido permanentemente do cardápio.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? 'Excluindo...' : 'Excluir Produto'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Variation Group Component
function VariationGroup({ groupIndex, form, onRemove }: any) {
    const [isExpanded, setIsExpanded] = useState(true)
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: `option_groups.${groupIndex}.options`
    })

    return (
        <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                    <Input
                        {...form.register(`option_groups.${groupIndex}.name`, { required: true })}
                        placeholder="Nome do grupo (ex: Tamanho, Borda)"
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onRemove}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            {...form.register(`option_groups.${groupIndex}.is_required`)}
                            className="rounded"
                        />
                        <span className="text-gray-700">Obrigatório</span>
                    </label>
                </div>

                <Separator />

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">Opções</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => append({ name: '', price_modifier: 0, is_available: true })}
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Adicionar
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {fields.map((option, optionIndex) => (
                            <div key={option.id} className="flex items-center gap-2">
                                <Input
                                    {...form.register(`option_groups.${groupIndex}.options.${optionIndex}.name`, { required: true })}
                                    placeholder="Nome da opção"
                                    className="flex-1 h-9"
                                />
                                <div className="relative w-24">
                                    <span className="absolute left-2 top-1.5 text-xs text-gray-500">R$</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...form.register(`option_groups.${groupIndex}.options.${optionIndex}.price_modifier`, { valueAsNumber: true })}
                                        placeholder="0.00"
                                        className="pl-7 h-9 text-sm"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-gray-400 hover:text-red-500"
                                    onClick={() => remove(optionIndex)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
