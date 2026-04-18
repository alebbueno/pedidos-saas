import { getOwnerRestaurant } from '@/actions/admin'
import { redirect } from 'next/navigation'
import { CustomizationClient } from './customization-client'

export default async function CustomizationPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) redirect('/onboarding')

    return (
        <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* Header */}
            <div className="min-w-0">
                <h1 className="text-xl font-bold sm:text-2xl">Personalização da vitrine</h1>
                <p className="mt-1 text-sm text-gray-500 sm:text-base">Customize a aparência da sua vitrine online</p>
            </div>

            <CustomizationClient restaurant={restaurant} />
        </div>
    )
}
