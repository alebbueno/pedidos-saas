'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Menu, LogOut, Loader2, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DASHBOARD_NAV_FOOTER_TABS,
    DASHBOARD_NAV_MORE_ITEMS,
    isDashboardNavActive,
} from '@/lib/dashboard-nav'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { updateStoreStatus } from '@/actions/settings'
import { toast } from 'sonner'

type MobileDashboardNavProps = {
    restaurantId?: string
    restaurantName?: string
    initialStoreOpen?: boolean
}

/**
 * Rodapé fixo do admin no mobile. Renderizado em `document.body` (portal)
 * para não ser coberto por overflow/stacking de ancestrais.
 */
export function MobileDashboardNav({
    restaurantId,
    restaurantName,
    initialStoreOpen = true,
}: MobileDashboardNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [moreOpen, setMoreOpen] = useState(false)
    const [storeOpen, setStoreOpen] = useState(initialStoreOpen)
    const [savingStore, setSavingStore] = useState(false)
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
    const supabase = createClient()

    useEffect(() => {
        setStoreOpen(initialStoreOpen)
    }, [initialStoreOpen])

    useEffect(() => {
        setMoreOpen(false)
    }, [pathname])

    useEffect(() => {
        setPortalTarget(document.body)
    }, [])

    const moreRouteActive = DASHBOARD_NAV_MORE_ITEMS.some((item) =>
        isDashboardNavActive(pathname, item.href)
    )

    const handleLogout = async () => {
        setMoreOpen(false)
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

    const brand = restaurantName?.trim() || 'Seu negócio'

    const bar = (
        <nav
            className={cn(
                'fixed left-3 right-3 z-[45] flex flex-col md:hidden',
                'bottom-[max(0.5rem,env(safe-area-inset-bottom,0px))]',
                'rounded-2xl border border-stone-200/90 bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-md',
                'motion-safe:transition-[box-shadow,transform] motion-safe:duration-200'
            )}
            aria-label="Navegação principal"
        >
            <div className="flex min-h-[3.5rem] w-full items-stretch sm:min-h-[3.75rem]">
                {DASHBOARD_NAV_FOOTER_TABS.map((item) => {
                    const Icon = item.icon
                    const active = isDashboardNavActive(pathname, item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            className={cn(
                                'flex min-h-[44px] min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-zinc-600 transition-colors active:bg-stone-100/90',
                                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500',
                                active && 'bg-orange-50/90 text-orange-700'
                            )}
                        >
                            <Icon className="size-[22px] shrink-0 stroke-[1.75]" aria-hidden />
                            <span className="max-w-full truncate text-[10px] font-semibold leading-none tracking-tight text-zinc-700 sm:text-[11px]">
                                {item.label}
                            </span>
                        </Link>
                    )
                })}

                <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
                    <SheetTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                'flex min-h-[44px] min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-zinc-600 transition-colors outline-none active:bg-stone-100/90',
                                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500',
                                (moreRouteActive || moreOpen) && 'bg-orange-50/90 text-orange-700'
                            )}
                            aria-expanded={moreOpen}
                            aria-label="Mais opções"
                        >
                            <Menu className="size-[22px] shrink-0 stroke-[1.75]" aria-hidden />
                            <span className="text-[10px] font-semibold leading-none tracking-tight text-zinc-700 sm:text-[11px]">Mais</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent
                        side="bottom"
                        className="z-[55] rounded-t-2xl border-x-0 px-0 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-2"
                    >
                        <SheetHeader className="border-b border-border/60 px-4 pb-3 text-left">
                            <SheetTitle className="text-base">Mais opções</SheetTitle>
                            <p className="text-muted-foreground flex items-center gap-2 text-sm font-normal">
                                <Store className="size-4 shrink-0 text-orange-500" aria-hidden />
                                <span className="truncate">{brand}</span>
                            </p>
                        </SheetHeader>

                        <div className="flex max-h-[55vh] flex-col gap-1 overflow-y-auto px-2 py-2">
                            {DASHBOARD_NAV_MORE_ITEMS.map((item) => {
                                const Icon = item.icon
                                const active = isDashboardNavActive(pathname, item.href)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        prefetch
                                        onClick={() => setMoreOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-orange-50 text-orange-900'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'size-5 shrink-0',
                                                active ? 'text-orange-600' : 'text-gray-500'
                                            )}
                                            aria-hidden
                                        />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>

                        {restaurantId ? (
                            <>
                                <Separator className="my-1" />
                                <div className="px-4 py-2">
                                    <div className="flex items-center justify-between gap-3 rounded-xl bg-orange-50/50 px-3 py-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {storeOpen ? 'Vendas abertas' : 'Vendas pausadas'}
                                            </p>
                                            <p className="text-muted-foreground text-xs leading-snug">
                                                {storeOpen
                                                    ? 'Checkout ativo na vitrine'
                                                    : 'Novos pedidos bloqueados'}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            {savingStore ? (
                                                <Loader2
                                                    className="text-orange-500 size-4 animate-spin"
                                                    aria-hidden
                                                />
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
                                </div>
                            </>
                        ) : null}

                        <div className="mt-1 px-4 pb-1">
                            <Button
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10 h-12 w-full justify-start gap-3 rounded-xl"
                                onClick={handleLogout}
                            >
                                <LogOut className="size-4" />
                                Sair do sistema
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    )

    if (portalTarget) {
        return createPortal(bar, portalTarget)
    }

    return bar
}
