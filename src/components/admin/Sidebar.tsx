'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Settings, LogOut, Users, Palette, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
        { href: '/dashboard/orders', label: 'Pedidos', icon: ShoppingBag },
        { href: '/dashboard/menu', label: 'Cardápio', icon: UtensilsCrossed },
        { href: '/dashboard/customers', label: 'Clientes', icon: Users },
        { href: '/dashboard/agent-config', label: 'Agente IA', icon: Bot },
        { href: '/dashboard/customization', label: 'Personalização', icon: Palette },
        { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
    ]

    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <aside className="w-[200px] border-r border-[#E4E4E7] bg-white hidden md:flex flex-col h-screen fixed left-0 top-0 z-30 shadow-none">
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b border-[#F4F4F5] bg-white">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                        <UtensilsCrossed className="size-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-none">MenuJá</span>
                        <span className="text-[10px] text-gray-500 mt-0.5 font-medium leading-none">Painel</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

                    return (
                        <Link key={item.href} href={item.href} className="block">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 h-10 transition-all duration-200",
                                    isActive
                                        ? "bg-amber-50 text-amber-900 hover:bg-amber-100 hover:text-amber-900 border border-amber-100 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                                )}
                            >
                                <Icon className={cn("size-4.5", isActive ? "text-amber-600" : "text-gray-500")} />
                                <span className={cn("text-sm font-medium", isActive ? "text-amber-900" : "text-gray-600")}>
                                    {item.label}
                                </span>
                            </Button>
                        </Link>
                    )
                })}
            </nav>

            {/* User / Logout Section */}
            <div className="p-4 border-t border-[#F4F4F5] bg-white">
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 h-10 text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-100 border border-transparent transition-all"
                >
                    <LogOut className="size-4.5" />
                    <span className="text-sm font-medium">Sair</span>
                </Button>
            </div>
        </aside>
    )
}
