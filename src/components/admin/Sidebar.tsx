'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, ShoppingBag, LayoutGrid, Settings, LogOut, Users, Palette, ChevronLeft, ChevronRight, Store, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { updateStoreStatus } from '@/actions/settings'
import { toast } from 'sonner'

interface SidebarProps {
    isCollapsed?: boolean
    toggleSidebar?: () => void
    /** Nome da loja do usuário (substitui o nome fixo do produto no topo) */
    restaurantName?: string
    restaurantId?: string
    /** `restaurants.is_open` — pausa manual de novos pedidos no catálogo público */
    initialStoreOpen?: boolean
}

export function Sidebar({
    isCollapsed = false,
    toggleSidebar,
    restaurantName,
    restaurantId,
    initialStoreOpen = true,
}: SidebarProps) {
    const pathname = usePathname()
    const [storeOpen, setStoreOpen] = useState(initialStoreOpen)
    const [savingStore, setSavingStore] = useState(false)

    useEffect(() => {
        setStoreOpen(initialStoreOpen)
    }, [initialStoreOpen])

    const navItems = [
        { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
        { href: '/dashboard/orders', label: 'Pedidos', icon: ShoppingBag },
        { href: '/dashboard/menu', label: 'Catálogo', icon: LayoutGrid },
        { href: '/dashboard/customers', label: 'Clientes', icon: Users },
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

    const handleStoreOpenChange = async (open: boolean) => {
        if (!restaurantId) return
        const prev = storeOpen
        setStoreOpen(open)
        setSavingStore(true)
        const result = await updateStoreStatus(restaurantId, open)
        setSavingStore(false)
        if (!result.success) {
            setStoreOpen(prev)
            toast.error(result.error || 'Não foi possível atualizar')
            return
        }
        toast.success(open ? 'Catálogo aceitando novos pedidos' : 'Catálogo pausado para novos pedidos')
        router.refresh()
    }

    const brandTitle = restaurantName?.trim() || 'Seu negócio'

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
            <div
                className={cn(
                    "h-20 flex items-center border-b border-[#F4F4F5] bg-white transition-all",
                    isCollapsed ? "justify-center px-0" : "px-6"
                )}
                title={brandTitle}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-orange-200 shadow-lg flex-shrink-0">
                        <Store className="size-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col animate-in fade-in duration-300 min-w-0 flex-1">
                            <span className="font-bold text-gray-900 text-lg leading-none truncate">{brandTitle}</span>
                            <span className="text-[11px] text-orange-600 mt-1 font-medium leading-none bg-orange-50 px-1.5 py-0.5 rounded-full w-fit">
                                Painel Admin
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {restaurantId && (
                <div
                    className={cn(
                        'border-b border-[#F4F4F5] bg-gradient-to-b from-orange-50/40 to-white',
                        isCollapsed ? 'px-2 py-3' : 'px-4 py-3'
                    )}
                >
                    {!isCollapsed ? (
                        <>
                            <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-2">
                                Vendas (manual)
                            </p>
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {storeOpen ? 'Aberto' : 'Pausado'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 leading-tight">
                                        {storeOpen ? 'Clientes podem finalizar compras' : 'Checkout bloqueado na vitrine'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {savingStore ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-orange-500" aria-hidden />
                                    ) : null}
                                    <Switch
                                        checked={storeOpen}
                                        onCheckedChange={handleStoreOpenChange}
                                        disabled={savingStore}
                                        className="data-[state=checked]:bg-green-600"
                                        aria-label={storeOpen ? 'Pausar vendas' : 'Abrir vendas'}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-1" title={storeOpen ? 'Vendas abertas' : 'Vendas pausadas'}>
                            {savingStore ? <Loader2 className="h-4 w-4 animate-spin text-orange-500" /> : null}
                            <Switch
                                checked={storeOpen}
                                onCheckedChange={handleStoreOpenChange}
                                disabled={savingStore}
                                className="data-[state=checked]:bg-green-600 scale-90"
                                aria-label={storeOpen ? 'Pausar vendas' : 'Abrir vendas'}
                            />
                        </div>
                    )}
                </div>
            )}

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
