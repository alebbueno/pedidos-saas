import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, LogIn, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const menuItems = [
        { label: "Funcionalidades", href: "#recursos" },
        { label: "Automações", href: "#ia" },
        { label: "Integrações", href: "#recursos" },
        { label: "Preços", href: "#precos" },
        { label: "FAQ", href: "#faq" },
    ];

    return (
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-6">
            <nav className="bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200/60 px-8 py-4 flex items-center justify-between w-full max-w-7xl transition-all duration-300 hover:shadow-xl">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                        P
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        pedidos saas.
                    </span>
                </Link>

                {/* Menu Items - Desktop */}
                <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                    {menuItems.map((item, i) => (
                        <li key={i}>
                            <Link
                                href={item.href}
                                className="hover:text-orange-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* User / CTA Area */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full h-10 px-6 shadow-md shadow-orange-200">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Minha Conta</span>
                                <ChevronDown className="w-3 h-3 opacity-70 ml-1" />
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full h-10 px-6 shadow-md shadow-orange-200 transition-transform hover:scale-105">
                            <Link href="/login" className="flex items-center gap-2">
                                <LogIn className="w-4 h-4" />
                                <span>Entrar</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </nav>
        </header>
    );
}
