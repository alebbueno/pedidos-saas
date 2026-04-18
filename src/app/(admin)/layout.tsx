import { getOwnerRestaurant } from '@/actions/admin'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const restaurant = await getOwnerRestaurant()

    return (
        <AdminShell
            restaurantId={restaurant?.id}
            restaurantName={restaurant?.name ?? undefined}
            initialStoreOpen={restaurant?.is_open ?? true}
        >
            {children}
        </AdminShell>
    )
}
