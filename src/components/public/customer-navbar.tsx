'use client'

import { useState, useEffect } from 'react'
import { useCustomerStore } from '@/store/customer-store'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User, ShoppingBag, UserCircle, LogOut, Package } from 'lucide-react'
import CustomerLoginModal from './customer-login-modal'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Restaurant } from '@/types'
import { cn } from '@/lib/utils'

interface CustomerNavbarProps {
    restaurant: Restaurant
}

export default function CustomerNavbar({ restaurant }: CustomerNavbarProps) {
    const [showLoginModal, setShowLoginModal] = useState(false)
    const customer = useCustomerStore((state) => state.customer)
    const isLoggedIn = useCustomerStore((state) => state.isLoggedIn)
    const logout = useCustomerStore((state) => state.logout)
    const pathname = usePathname()

    // Sessão do cliente é por loja: evita "logado" de outra LP com o mesmo telefone no storage
    useEffect(() => {
        if (!customer) return
        const scoped = customer.restaurant_id
        if (!scoped || scoped !== restaurant.id) {
            logout()
        }
    }, [customer, restaurant.id, logout])

    const primaryColor = restaurant.primary_color || '#F97316'
    const slug = restaurant.slug

    const navLinks = [
        { href: `/lp/${slug}/my-orders`, label: 'Meus Pedidos', icon: Package },
        { href: `/lp/${slug}/profile`, label: 'Perfil', icon: UserCircle },
        { href: `/lp/${slug}/cart`, label: 'Carrinho', icon: ShoppingBag },
    ]

    return (
        <>
            <div className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm pt-[env(safe-area-inset-top,0px)] supports-[backdrop-filter]:bg-white/80">
                <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
                    <div className="flex items-center justify-between min-h-[3.5rem] py-1.5 gap-2">
                        {/* Logo/Name — área de toque ampla no mobile */}
                        <Link
                            href={`/lp/${slug}`}
                            className="flex items-center gap-2 sm:gap-3 min-h-11 min-w-0 py-1 -ml-1 pl-1 pr-2 rounded-xl hover:opacity-90 active:opacity-80 transition-opacity group touch-manipulation"
                        >
                            {restaurant.logo_url ? (
                                <div className="w-9 h-9 sm:w-8 sm:h-8 relative rounded-full overflow-hidden border border-stone-200 shadow-sm shrink-0">
                                    <img
                                        src={restaurant.logo_url}
                                        alt={restaurant.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {restaurant.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span className="font-bold text-base sm:text-lg text-stone-900 truncate max-w-[10rem] sm:max-w-none">
                                {restaurant.name}
                            </span>
                        </Link>

                        {/* Navigation Links (Desktop) - Only show if logged in */}
                        {isLoggedIn && (
                            <nav className="hidden md:flex items-center gap-8 bg-stone-50 px-6 py-2 rounded-full border border-stone-200/80">
                                {navLinks.map((link) => {
                                    const Icon = link.icon
                                    const isActive = pathname === link.href
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                "flex items-center gap-2 text-sm font-medium transition-all duration-200",
                                                isActive ? "font-bold" : "text-stone-500 hover:text-stone-900"
                                            )}
                                            style={isActive ? { color: primaryColor } : {}}
                                        >
                                            <Icon className={cn("w-4 h-4", isActive ? "fill-current" : "")} />
                                            {link.label}
                                        </Link>
                                    )
                                })}
                            </nav>
                        )}

                        {/* Login/User Menu */}
                        <div>
                            {!isLoggedIn ? (
                                <Button
                                    onClick={() => setShowLoginModal(true)}
                                    className="flex items-center gap-2 min-h-11 h-11 px-5 sm:px-6 shadow-sm hover:shadow-md transition-shadow font-semibold rounded-full touch-manipulation"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <User className="w-4 h-4" />
                                    Entrar
                                </Button>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-2 sm:gap-3 min-h-11 h-11 pl-1.5 pr-3 sm:pr-4 rounded-full hover:bg-stone-50 border border-transparent hover:border-stone-200/80 transition-colors touch-manipulation"
                                        >
                                            <div
                                                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {customer?.name?.substring(0, 2).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex flex-col items-start hidden md:flex text-left">
                                                <span className="text-xs text-stone-500 font-medium">Olá,</span>
                                                <span className="text-sm font-bold text-stone-900 leading-none truncate max-w-[8rem]">
                                                    {customer?.name?.split(' ')[0]}
                                                </span>
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-gray-100">
                                        {/* Mobile Navigation Links */}
                                        <div className="md:hidden">
                                            {navLinks.map((link) => {
                                                const Icon = link.icon
                                                return (
                                                    <DropdownMenuItem key={link.href} asChild className="rounded-lg mb-1 focus:bg-stone-50">
                                                        <Link
                                                            href={link.href}
                                                            className="flex items-center gap-3 min-h-11 py-2 cursor-pointer font-medium text-stone-800 touch-manipulation"
                                                        >
                                                            <div className="p-1.5 rounded-md bg-stone-100">
                                                                <Icon className="w-4 h-4 text-stone-600" />
                                                            </div>
                                                            {link.label}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )
                                            })}
                                            <DropdownMenuSeparator className="my-2" />
                                        </div>

                                        <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer rounded-lg hover:bg-red-50 focus:bg-red-50 py-2.5">
                                            <div className="p-1.5 rounded-md bg-red-100 mr-3">
                                                <LogOut className="w-4 h-4 text-red-600" />
                                            </div>
                                            <span className="font-semibold">Sair da Conta</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CustomerLoginModal
                open={showLoginModal}
                onOpenChange={setShowLoginModal}
                restaurantId={restaurant.id}
            />
        </>
    )
}
