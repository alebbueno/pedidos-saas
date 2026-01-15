import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 text-white shadow-xl flex-shrink-0 hidden md:flex flex-col">
                <div className="p-8 border-b border-slate-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Pedidos SaaS</h1>
                    <p className="text-xs text-slate-400 mt-1">Painel Administrativo</p>
                </div>

                <nav className="flex-1 p-6 space-y-3">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-medium">
                            <LayoutDashboard className="w-5 h-5" />
                            Visão Geral
                        </Button>
                    </Link>
                    <Link href="/dashboard/orders">
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-medium">
                            <ShoppingBag className="w-5 h-5" />
                            Pedidos
                        </Button>
                    </Link>
                    <Link href="/dashboard/menu">
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-medium">
                            <UtensilsCrossed className="w-5 h-5" />
                            Cardápio
                        </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-medium">
                            <Settings className="w-5 h-5" />
                            Configurações
                        </Button>
                    </Link>
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                        <LogOut className="w-5 h-5" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
