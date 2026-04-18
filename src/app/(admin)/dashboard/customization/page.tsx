import { getOwnerRestaurant } from '@/actions/admin'
import { redirect } from 'next/navigation'
import { CustomizationClient } from './customization-client'

export default async function CustomizationPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) redirect('/onboarding')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Personalização da vitrine</h1>
                <p className="text-gray-500 mt-1">Customize a aparência da sua vitrine online</p>
            </div>

            <CustomizationClient restaurant={restaurant} />
        </div>
    )
}
