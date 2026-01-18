import { Restaurant } from '@/types'
import Image from 'next/image'

export default function RestaurantHeader({ restaurant }: { restaurant: Restaurant }) {
    const primaryColor = restaurant.primary_color || '#F97316'
    const backgroundColor = restaurant.background_color || '#FFFFFF'
    const textColor = restaurant.text_color || '#000000'

    return (
        <div className="relative mb-24">
            {/* Banner */}
            <div className="relative h-48 overflow-hidden">
                {restaurant.banner_url ? (
                    <Image
                        src={restaurant.banner_url}
                        alt={`${restaurant.name} banner`}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div
                        className="h-full w-full"
                        style={{
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
                        }}
                    >
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
                    </div>
                )}
            </div>

            {/* Restaurant Info Card */}
            <div className="absolute top-24 left-0 right-0 container mx-auto px-4 max-w-2xl text-center">
                <div
                    className="rounded-3xl shadow-xl p-6 relative"
                    style={{ backgroundColor }}
                >
                    {/* Logo - Overlapping */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg overflow-hidden relative">
                            {restaurant.logo_url ? (
                                <Image
                                    src={restaurant.logo_url}
                                    alt={restaurant.name}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {restaurant.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-14">
                        <h1
                            className="text-3xl font-extrabold mt-3"
                            style={{ color: textColor }}
                        >
                            {restaurant.name}
                        </h1>

                        {restaurant.description && (
                            <p className="text-gray-500 mt-2 font-medium">
                                {restaurant.description}
                            </p>
                        )}

                        {restaurant.address && (
                            <p className="text-gray-500 mt-1 text-sm">
                                📍 {restaurant.address}
                            </p>
                        )}

                        <div className="mt-4 flex justify-center gap-3 text-sm font-medium flex-wrap">
                            <div
                                className={`px-4 py-1.5 rounded-full flex items-center gap-2 ${restaurant.is_open
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${restaurant.is_open ? 'bg-green-500' : 'bg-red-500'}`} />
                                {restaurant.is_open ? 'Aberto agora' : 'Fechado'}
                            </div>

                            {restaurant.phone && (
                                <a
                                    href={`tel:${restaurant.phone}`}
                                    className="flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    📞 {restaurant.phone}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
