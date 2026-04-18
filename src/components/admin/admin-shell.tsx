'use client'

import { Sidebar } from '@/components/admin/Sidebar'
import { useState } from 'react'
import { GlobalOrderNotifications } from '@/components/admin/global-order-notifications'

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

    return (
        <div className="flex min-h-screen bg-[#FAFAFA]">
            {/* Global Notifications Listener */}
            {restaurantId && <GlobalOrderNotifications restaurantId={restaurantId} />}

            {/* Sidebar Component */}
            <Sidebar
                isCollapsed={isCollapsed}
                toggleSidebar={() => setIsCollapsed(!isCollapsed)}
                restaurantName={restaurantName}
                restaurantId={restaurantId}
                initialStoreOpen={initialStoreOpen}
            />

            {/* Main Content */}
            <main
                className={`flex-1 overflow-y-auto h-screen bg-[#FAFAFA] transition-all duration-300 ease-in-out ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[260px]'
                    }`}
            >
                <div className="p-8 max-w-[1600px] mx-auto min-h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
