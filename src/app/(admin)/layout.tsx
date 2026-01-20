'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Settings, LogOut, Users, Palette, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
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

    return (
        <div className="flex min-h-screen bg-[#F5F5F0]">
            {/* Sidebar */}
            <aside className="w-[180px] bg-white flex-shrink-0 hidden md:flex flex-col border-r border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">Foodbond</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Painel Administrativo</p>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 h-10 font-normal transition-colors",
                                        isActive
                                            ? "bg-orange-500 text-white hover:bg-orange-600 hover:text-white"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm">{item.label}</span>
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-3 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-10 text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sair</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
