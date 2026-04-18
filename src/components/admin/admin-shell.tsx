'use client'

import { Sidebar } from '@/components/admin/Sidebar'
import { MobileDashboardNav } from '@/components/admin/mobile-dashboard-nav'
import { useState } from 'react'
import { GlobalOrderNotifications } from '@/components/admin/global-order-notifications'
import { Store } from 'lucide-react'

interface AdminShellProps {
    children: React.ReactNode
    restaurantId?: string
    /** Nome da loja exibido no topo do sidebar */
    restaurantName?: string
    /** Pausa manual de vendas (`restaurants.is_open`), vindo do servidor */
    initialStoreOpen?: boolean
}

export function AdminShell({ children, restaurantId, restaurantName, initialStoreOpen = true }: AdminShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    const brandTitle = restaurantName?.trim() || 'Seu negócio'

    return (
        <div className="relative flex h-[100dvh] min-h-0 max-md:overflow-hidden bg-[#FAFAFA] md:h-screen md:min-h-screen">
            {restaurantId && <GlobalOrderNotifications restaurantId={restaurantId} />}

            <Sidebar
                isCollapsed={isCollapsed}
                toggleSidebar={() => setIsCollapsed(!isCollapsed)}
                restaurantName={restaurantName}
                restaurantId={restaurantId}
                initialStoreOpen={initialStoreOpen}
            />

            <header className="fixed inset-x-0 top-0 z-[44] flex h-14 items-center gap-2 border-b border-stone-200/90 bg-white/95 px-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md md:hidden">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-200/60">
                    <Store className="size-5 text-white" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{brandTitle}</p>
                    <p className="text-[11px] font-medium text-orange-600">Painel admin</p>
                </div>
            </header>

            <main
                className={`relative z-0 flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-[#FAFAFA] transition-all duration-300 ease-in-out
                    max-md:overflow-x-auto max-md:scroll-pb-[10rem] md:overflow-x-clip
                    pt-14 md:pb-0 md:pt-0
                    ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[260px]'}`}
            >
                {/*
                  Tab bar do admin é renderizada em portal no `body` (fora deste `main`).
                  Um bloco em fluxo no fim garante área rolável livre — só `padding` no `main`
                  falha em alguns casos com flex (`flex-1` + altura implícita).
                */}
                <div className="flex min-h-0 w-full min-w-0 max-w-none flex-col px-3 py-4 sm:px-5 md:flex-1 md:px-8 md:py-8">
                    {children}
                    <div
                        className="pointer-events-none shrink-0 md:hidden"
                        aria-hidden
                        style={{
                            minHeight:
                                'calc(max(0.5rem, env(safe-area-inset-bottom, 0px)) + 4.5rem + 1.5rem)',
                        }}
                    />
                </div>
            </main>

            <MobileDashboardNav
                restaurantId={restaurantId}
                restaurantName={restaurantName}
                initialStoreOpen={initialStoreOpen}
            />
        </div>
    )
}
