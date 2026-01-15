import { getMenu } from '@/actions/restaurant'
import { getOwnerRestaurant } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import Image from 'next/image'

export default async function MenuPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) return <div>Restaurant not found</div>

    const { products } = await getMenu(restaurant.id)

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Cardápio</h1>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Produto
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                        <div className="relative h-40 bg-gray-100">
                            {product.image_url ? (
                                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">Sem foto</div>
                            )}
                        </div>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                            <div className="mt-2 font-bold text-primary">
                                R$ {Number(product.base_price).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
