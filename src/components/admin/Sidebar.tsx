'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Settings, LogOut, Users, Palette, Bot, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
    isCollapsed?: boolean
    toggleSidebar?: () => void
}

export function Sidebar({ isCollapsed = false, toggleSidebar }: SidebarProps) {
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
        <aside
            className={cn(
                "border-r border-[#E4E4E7] bg-white hidden md:flex flex-col h-screen fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out shadow-sm",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Toggle Button */}
            {toggleSidebar && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-9 h-6 w-6 rounded-full border border-slate-200 bg-white shadow-md text-slate-500 hover:text-orange-500 hover:bg-orange-50 z-40 hidden md:flex items-center justify-center p-0"
                >
                    {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </Button>
            )}

            {/* Logo Section */}
            <div className={cn(
                "h-20 flex items-center border-b border-[#F4F4F5] bg-white transition-all",
                isCollapsed ? "justify-center px-0" : "px-6"
            )}>
                <div className="flex items-center gap-3">
                    <div className="size-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-orange-200 shadow-lg flex-shrink-0">
                        <UtensilsCrossed className="size-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col animate-in fade-in duration-300">
                            <span className="font-bold text-gray-900 text-lg leading-none">MenuJá</span>
                            <span className="text-[11px] text-orange-600 mt-1 font-medium leading-none bg-orange-50 px-1.5 py-0.5 rounded-full w-fit">
                                Painel Admin
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

                    return (
                        <Link key={item.href} href={item.href} className="block group">
                            <div
                                className={cn(
                                    "flex items-center transition-all duration-200 rounded-xl relative overflow-hidden",
                                    isCollapsed ? "justify-center h-12 w-12 mx-auto" : "h-12 px-3 w-full",
                                    isActive
                                        ? "bg-orange-50 text-orange-900 shadow-sm border border-orange-100/50"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                {isActive && !isCollapsed && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full" />
                                )}
                                <Icon className={cn(
                                    "transition-all flex-shrink-0",
                                    isCollapsed ? "size-6" : "size-5 mr-3",
                                    isActive ? "text-orange-600" : "text-gray-500 group-hover:text-gray-700"
                                )} />
                                {!isCollapsed && (
                                    <span className={cn(
                                        "text-sm font-medium truncate",
                                        isActive ? "text-orange-900" : "text-gray-600"
                                    )}>
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* User / Logout Section */}
            <div className={cn(
                "p-4 border-t border-[#F4F4F5] bg-gray-50/50",
                isCollapsed ? "flex justify-center" : ""
            )}>
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    title={isCollapsed ? "Sair" : undefined}
                    className={cn(
                        "justify-start transition-all hover:bg-red-50 hover:text-red-700 hover:border-red-100 border border-transparent",
                        isCollapsed ? "h-10 w-10 p-0 justify-center rounded-lg" : "w-full gap-3 h-11 px-3"
                    )}
                >
                    <LogOut className={cn("text-gray-500", isCollapsed ? "size-5" : "size-4.5")} />
                    {!isCollapsed && <span className="text-sm font-medium text-gray-600">Sair do Sistema</span>}
                </Button>
            </div>
        </aside>
    )
}
