import type { LucideIcon } from 'lucide-react'
import {
    LayoutDashboard,
    ShoppingBag,
    LayoutGrid,
    Users,
    Palette,
    Settings,
} from 'lucide-react'

export type DashboardNavItem = {
    href: string
    label: string
    icon: LucideIcon
}

/** Itens do sidebar desktop e base do menu mobile */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
    { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
    { href: '/dashboard/orders', label: 'Pedidos', icon: ShoppingBag },
    { href: '/dashboard/menu', label: 'Catálogo', icon: LayoutGrid },
    { href: '/dashboard/customers', label: 'Clientes', icon: Users },
    { href: '/dashboard/customization', label: 'Personalização', icon: Palette },
    { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
]

/** Abas fixas no rodapé mobile (estilo app) */
export const DASHBOARD_NAV_FOOTER_TABS: DashboardNavItem[] = DASHBOARD_NAV_ITEMS.slice(0, 4)

/** Entradas extras no sheet “Mais” + mesmas rotas no sidebar */
export const DASHBOARD_NAV_MORE_ITEMS: DashboardNavItem[] = DASHBOARD_NAV_ITEMS.slice(4)

export function isDashboardNavActive(pathname: string | null, href: string): boolean {
    if (!pathname) return false
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
}
