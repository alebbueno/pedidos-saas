import { Restaurant } from '@/types'
import Image from 'next/image'
import { MapPin, Phone } from 'lucide-react'
import { RestaurantOpenStatusPill } from '@/components/public/restaurant-open-status-pill'

export default function RestaurantHeader({ restaurant }: { restaurant: Restaurant }) {
    const primaryColor = restaurant.primary_color || '#F97316'
    const backgroundColor = restaurant.background_color || '#FFFFFF'
    const textColor = restaurant.text_color || '#000000'

    return (
        <section className="relative z-20 mb-6 overflow-x-clip sm:mb-10">
            {/* Banner */}
            <div className="relative h-44 overflow-hidden sm:h-52">
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
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                        }}
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.08]" />
                    </div>
                )}
            </div>

            {/* Card no fluxo: overlap só com margin negativo — o <main> nunca “sobe” por baixo do card */}
            <div className="relative z-10 mx-auto w-full max-w-2xl -mt-[4.5rem] px-3 sm:-mt-[5.25rem] sm:px-4">
                <div
                    className="relative rounded-2xl border border-stone-200/70 px-5 pb-6 pt-12 shadow-xl sm:rounded-3xl sm:px-7 sm:pb-8 sm:pt-16"
                    style={{ backgroundColor }}
                >
                    <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 sm:-top-12">
                        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-white p-1 shadow-lg ring-1 ring-stone-100 sm:h-24 sm:w-24">
                            {restaurant.logo_url ? (
                                <Image
                                    src={restaurant.logo_url}
                                    alt={restaurant.name}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div
                                    className="flex h-full w-full items-center justify-center rounded-full text-2xl font-bold text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {restaurant.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center">
                        <h1
                            className="mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl"
                            style={{ color: textColor }}
                        >
                            {restaurant.name}
                        </h1>

                        {restaurant.description && (
                            <p className="mx-auto mt-3 max-w-lg px-0.5 text-pretty text-sm font-medium leading-relaxed text-stone-600 sm:text-base">
                                {restaurant.description}
                            </p>
                        )}

                        {restaurant.address && (
                            <p className="mx-auto mt-3 flex max-w-lg items-start justify-center gap-2 text-left text-sm text-stone-600">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" aria-hidden />
                                <span className="break-words">{restaurant.address}</span>
                            </p>
                        )}

                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
                            <RestaurantOpenStatusPill restaurant={restaurant} />

                            {restaurant.phone && (
                                <a
                                    href={`tel:${restaurant.phone}`}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-stone-100 px-4 text-stone-800 transition-colors hover:bg-stone-200 active:bg-stone-300 touch-manipulation"
                                >
                                    <Phone className="h-4 w-4 shrink-0 text-stone-600" aria-hidden />
                                    <span className="tabular-nums">{restaurant.phone}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
