import { getOwnerRestaurant, getCustomers } from "@/actions/admin"
import { CustomersClient } from "./customers-client"
import { redirect } from "next/navigation"

export default async function CustomersPage() {
    const restaurant = await getOwnerRestaurant()

    if (!restaurant) {
        redirect('/login')
    }

    const initialCustomers = await getCustomers(restaurant.id)

    return (
        <div>
            <CustomersClient
                restaurantId={restaurant.id}
                initialCustomers={initialCustomers}
            />
        </div>
    )
}
