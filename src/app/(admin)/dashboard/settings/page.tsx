import { getOwnerRestaurant } from '@/actions/admin'
import { redirect } from 'next/navigation'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
    const restaurant = await getOwnerRestaurant()
    if (!restaurant) redirect('/onboarding')

    return <SettingsClient restaurant={restaurant} />
}
