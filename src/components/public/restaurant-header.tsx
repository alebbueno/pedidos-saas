import { Restaurant } from '@/types'
import Image from 'next/image'

export default function RestaurantHeader({ restaurant }: { restaurant: Restaurant }) {
    return (
        <div className="relative mb-24">
            <div className="h-48 bg-gradient-to-r from-primary/80 to-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
            </div>

            <div className="absolute top-24 left-0 right-0 container mx-auto px-4 max-w-2xl text-center">
                <div className="bg-white rounded-3xl shadow-xl p-6 relative">
                    <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg mx-auto -mt-16 overflow-hidden relative">
                        {restaurant.logo_url ? (
                            <Image
                                src={restaurant.logo_url}
                                alt={restaurant.name}
                                fill
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                                {restaurant.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-extrabold mt-3 text-gray-900">{restaurant.name}</h1>
                    <p className="text-gray-500 mt-1 font-medium">{restaurant.address}</p>

                    <div className="mt-4 flex justify-center gap-3 text-sm font-medium">
                        <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 ${restaurant.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span className={`w-2 h-2 rounded-full ${restaurant.is_open ? 'bg-green-500' : 'bg-red-500'}`} />
                            {restaurant.is_open ? 'Aberto agora' : 'Fechado'}
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full text-gray-700">
                            🕒 {restaurant.opening_hours || 'Consulte horário'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
