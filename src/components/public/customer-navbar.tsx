'use client'

import { useState } from 'react'
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

    const primaryColor = restaurant.primary_color || '#F97316'
    const slug = restaurant.slug

    const navLinks = [
        { href: `/lp/${slug}/my-orders`, label: 'Meus Pedidos', icon: Package },
        { href: `/lp/${slug}/profile`, label: 'Perfil', icon: UserCircle },
        { href: `/lp/${slug}/cart`, label: 'Carrinho', icon: ShoppingBag },
    ]

    return (
        <>
            <div className="border-b bg-white sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo/Name */}
                        <Link href={`/lp/${slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                            {restaurant.logo_url ? (
                                <div className="w-8 h-8 relative rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                    <img
                                        src={restaurant.logo_url}
                                        alt={restaurant.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {restaurant.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span className="font-bold text-lg text-gray-800 group-hover:text-gray-600 transition-colors">
                                {restaurant.name}
                            </span>
                        </Link>

                        {/* Navigation Links (Desktop) - Only show if logged in */}
                        {isLoggedIn && (
                            <nav className="hidden md:flex items-center gap-8 bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
                                {navLinks.map((link) => {
                                    const Icon = link.icon
                                    const isActive = pathname === link.href
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                "flex items-center gap-2 text-sm font-medium transition-all duration-200",
                                                isActive ? "font-bold scale-105" : "text-gray-500 hover:text-gray-800"
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
                                    className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all font-semibold rounded-full px-6"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <User className="w-4 h-4" />
                                    Entrar
                                </Button>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-4 py-2 h-auto rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {customer?.name?.substring(0, 2).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex flex-col items-start hidden md:flex">
                                                <span className="text-xs text-gray-500 font-medium">Olá,</span>
                                                <span className="text-sm font-bold text-gray-800 leading-none">{customer?.name?.split(' ')[0]}</span>
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-gray-100">
                                        {/* Mobile Navigation Links */}
                                        <div className="md:hidden">
                                            {navLinks.map((link) => {
                                                const Icon = link.icon
                                                return (
                                                    <DropdownMenuItem key={link.href} asChild className="rounded-lg mb-1 focus:bg-gray-50">
                                                        <Link href={link.href} className="flex items-center gap-3 py-2 cursor-pointer font-medium text-gray-700">
                                                            <div className="p-1.5 rounded-md bg-gray-50">
                                                                <Icon className="w-4 h-4 text-gray-500" />
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

            <CustomerLoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        </>
    )
}
