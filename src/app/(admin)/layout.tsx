'use client'

import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-[#FAFAFA]">
            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto md:ml-[200px] h-screen bg-[#FAFAFA]">
                <div className="p-8 max-w-[1600px] mx-auto min-h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
