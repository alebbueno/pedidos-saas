'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Product, Category, type BusinessSegment } from '@/types'
import { getSegmentRules } from '@/lib/segment-rules'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash, ChevronUp, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ProductForm } from '@/components/admin/product-form'
import { upsertCategory, deleteCategory, updateCategoryOrder, updateProductAvailability } from '@/actions/admin'
import { cn } from '@/lib/utils'

interface MenuManagerProps {
    restaurantId: string
    restaurantSegment?: BusinessSegment | string | null
    initialProducts: (Product & { product_option_groups: any[] })[]
    initialCategories: Category[]
}

export function MenuManager({ restaurantId, restaurantSegment, initialProducts, initialCategories }: MenuManagerProps) {
    const router = useRouter()
    const segmentRules = useMemo(() => getSegmentRules(restaurantSegment), [restaurantSegment])
    const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')

    // Maintain local state for reordering
    const [categories, setCategories] = useState(initialCategories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)))
    const [products, setProducts] = useState(initialProducts)

    useEffect(() => {
        setProducts(initialProducts)
    }, [initialProducts])

    useEffect(() => {
        setCategories(initialCategories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)))
    }, [initialCategories])

    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<(Product & { product_option_groups: any[] }) | undefined>(undefined)

    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [allowsHalfAndHalf, setAllowsHalfAndHalf] = useState(false)
    const [isSavingCategory, setIsSavingCategory] = useState(false)

    const handleEditProduct = (product: any) => {
        setSelectedProduct(product)
        setIsSheetOpen(true)
    }

    const handleNewProduct = () => {
        setSelectedProduct(undefined)
        setIsSheetOpen(true)
    }

    const handleSuccessProduct = () => {
        setIsSheetOpen(false)
        router.refresh()
    }

    const filteredProducts =
        selectedCategory === 'all' ? products : products.filter((p) => p.category_id === selectedCategory)

    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

    const handleSaveCategory = async () => {
        if (!newCategoryName.trim()) return

        setIsSavingCategory(true)
        try {
            const result = await upsertCategory(
                restaurantId,
                newCategoryName,
                editingCategory?.id,
                segmentRules.allowHalfAndHalf ? allowsHalfAndHalf : false
            )
            if (result?.error) {
                alert(result.error)
                return
            }
            setNewCategoryName('')
            setAllowsHalfAndHalf(false)
            setEditingCategory(null)
            setIsCategoryDialogOpen(false)
        } catch (e) {
            console.error(e)
            alert('Erro ao salvar categoria')
        } finally {
            setIsSavingCategory(false)
        }
    }

    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return
        try {
            const result = await deleteCategory(categoryToDelete)
            if (result?.error) {
                alert(result.error)
                return
            }
            if (selectedCategory === categoryToDelete) setSelectedCategory('all')
            setCategoryToDelete(null)
        } catch (e) {
            console.error(e)
            alert('Erro ao excluir')
        }
    }

    const openCategoryDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category)
            setNewCategoryName(category.name)
            setAllowsHalfAndHalf(category.allows_half_and_half || false)
        } else {
            setEditingCategory(null)
            setNewCategoryName('')
            setAllowsHalfAndHalf(false)
        }
        setIsCategoryDialogOpen(true)
    }

    const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === categories.length - 1) return

        const newCategories = [...categories]
        const swapIndex = direction === 'up' ? index - 1 : index + 1

        // Swap elements
        const temp = newCategories[index]
        newCategories[index] = newCategories[swapIndex]
        newCategories[swapIndex] = temp

        // Update display_order based on new index
        // We use index * 10 or similar to space them out, 
        // or just use 0, 1, 2, 3 simple sequence for simplicity here.
        const updatedWithOrder = newCategories.map((cat, i) => ({
            ...cat,
            display_order: i
        }))

        // Optimistic update
        setCategories(updatedWithOrder)

        // Server update
        try {
            await updateCategoryOrder(updatedWithOrder.map(c => ({ id: c.id, display_order: c.display_order! })))
        } catch (error) {
            console.error('Failed to reorder', error)
            // Revert on error (optional, skipping for MVP simplicity as error is rare)
        }
    }

    return (
        <div className="flex min-w-0 flex-col gap-6 max-md:pb-6 lg:flex-row lg:gap-8">
            {/* Left Sidebar - Categories */}
            <aside className="w-full shrink-0 lg:w-64">
                <Card className="bg-white lg:sticky lg:top-6">
                    <CardHeader className="pb-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Categorias</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                                onClick={() => openCategoryDialog()}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1 pt-3 pb-4">
                        <Button
                            variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                            className={cn(
                                "w-full justify-start font-normal text-sm h-9",
                                selectedCategory === 'all'
                                    ? "bg-orange-500 text-white hover:bg-orange-600"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                            onClick={() => setSelectedCategory('all')}
                        >
                            Todos os produtos
                        </Button>
                        {categories.map((cat, index) => (
                            <div key={cat.id} className="group relative flex items-center gap-1">
                                {/* Reorder Controls - Visible on Hover */}
                                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 text-gray-400 hover:text-orange-500 disabled:opacity-30"
                                        disabled={index === 0}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleMoveCategory(index, 'up')
                                        }}
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 text-gray-400 hover:text-orange-500 disabled:opacity-30"
                                        disabled={index === categories.length - 1}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleMoveCategory(index, 'down')
                                        }}
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div className="flex-1 relative">
                                    <Button
                                        variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                                        className={cn(
                                            "w-full justify-start font-normal text-sm h-9 pr-16",
                                            selectedCategory === cat.id
                                                ? "bg-orange-500 text-white hover:bg-orange-600"
                                                : "text-gray-700 hover:bg-gray-100"
                                        )}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </Button>
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-7 w-7 hover:bg-orange-50",
                                                selectedCategory === cat.id ? "text-white hover:text-orange-500" : "text-gray-600 hover:text-orange-500"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openCategoryDialog(cat)
                                            }}
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-7 w-7 hover:bg-red-50",
                                                selectedCategory === cat.id ? "text-white hover:text-red-500" : "text-gray-600 hover:text-red-500"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setCategoryToDelete(cat.id)
                                            }}
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </aside>

            {/* Main Content */}
            <main className="min-w-0 flex-1">
                <div className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                            {selectedCategory === 'all'
                                ? 'Todos os Produtos'
                                : categories.find(c => c.id === selectedCategory)?.name || 'Produtos'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            ({filteredProducts.length})
                        </p>
                    </div>
                    <Button onClick={handleNewProduct} className="w-full shrink-0 bg-orange-500 hover:bg-orange-600 sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Produto
                    </Button>
                </div>

                {filteredProducts.length === 0 ? (
                    <Card className="border-dashed bg-white">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-gray-500 mb-4">
                                {products.length === 0
                                    ? 'Nenhum produto cadastrado.'
                                    : 'Nenhum produto nesta categoria.'}
                            </p>
                            <Button variant="outline" onClick={handleNewProduct}>
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Produto
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="group overflow-hidden hover:shadow-lg transition-all duration-200 bg-white border border-gray-100"
                            >
                                <button
                                    type="button"
                                    className="w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                                    onClick={() => handleEditProduct(product)}
                                >
                                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                                Sem imagem
                                            </div>
                                        )}
                                        {product.is_active === false && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded-full">
                                                    Indisponível na vitrine
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-semibold text-base leading-tight line-clamp-1">
                                                {product.name}
                                            </h3>
                                        </div>
                                        {product.is_made_to_order &&
                                            product.made_to_order_lead_days != null &&
                                            product.made_to_order_lead_days > 0 && (
                                                <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mb-2 w-fit">
                                                    Encomenda · {product.made_to_order_lead_days}{' '}
                                                    {product.made_to_order_lead_days === 1 ? 'dia' : 'dias'}
                                                </p>
                                            )}
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px]">
                                            {product.description || 'Sem descrição'}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="text-lg font-bold text-gray-900">
                                                R$ {Number(product.base_price).toFixed(2).replace('.', ',')}
                                            </div>
                                            {product.product_option_groups && product.product_option_groups.length > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    {product.product_option_groups.length} variações
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </button>
                                <div
                                    className="flex items-center justify-between gap-3 px-4 pb-4 pt-0 border-t border-gray-100"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-800">Disponível na vitrine</p>
                                        <p className="text-[11px] text-gray-500">
                                            {product.is_active !== false ? 'Cliente pode ver e comprar' : 'Oculto do catálogo público'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={product.is_active !== false}
                                        onCheckedChange={async (checked) => {
                                            const prev = products
                                            setProducts((list) =>
                                                list.map((p) => (p.id === product.id ? { ...p, is_active: checked } : p))
                                            )
                                            const result = await updateProductAvailability(product.id, checked)
                                            if (!result.success) {
                                                setProducts(prev)
                                                toast.error(result.error || 'Não foi possível atualizar')
                                                return
                                            }
                                            toast.success(checked ? 'Produto disponível' : 'Produto indisponível')
                                            router.refresh()
                                        }}
                                        aria-label="Disponível na vitrine"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Product Sheet (Side Drawer) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full min-h-0 w-full max-w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(100vw,640px)] sm:w-[min(100vw,640px)]"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>{selectedProduct ? 'Editar Produto' : 'Novo Produto'}</SheetTitle>
                    </SheetHeader>
                    <ProductForm
                        key={selectedProduct?.id || 'new'}
                        restaurantId={restaurantId}
                        restaurantSegment={restaurantSegment ?? 'food'}
                        product={selectedProduct}
                        categories={categories}
                        onSuccess={handleSuccessProduct}
                        onOpenCategoryDialog={() => openCategoryDialog()}
                    />
                </SheetContent>
            </Sheet>

            {/* Category Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                        <DialogDescription>
                            Organize seu catálogo em categorias.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome da Categoria</Label>
                            <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Ex: Eletrônicos, Acessórios, Promoções"
                            />
                        </div>
                        {segmentRules.allowHalfAndHalf && (
                            <div className="flex items-center justify-between space-x-2 border rounded-lg p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="half-and-half">Permite Meio a Meio</Label>
                                    <p className="text-sm text-gray-500">
                                        Clientes podem combinar produtos diferentes desta categoria
                                    </p>
                                </div>
                                <Switch
                                    id="half-and-half"
                                    checked={allowsHalfAndHalf}
                                    onCheckedChange={setAllowsHalfAndHalf}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveCategory} disabled={isSavingCategory} className="bg-orange-500 hover:bg-orange-600">
                            {isSavingCategory ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Categoria?</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir esta categoria? Os produtos nela não serão excluídos, mas ficarão sem categoria.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCategoryToDelete(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDeleteCategory}>Excluir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
