import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, LogIn } from "lucide-react";

export function HeaderNew() {
    const menuItems = [
        { label: "Funcionalidades", href: "#features" },
        { label: "Automações", href: "#ia" },
        { label: "Planos", href: "#precos" },
        { label: "FAQ", href: "#faq" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-[#FFF9F2] px-4 md:px-6 py-4 border-b border-orange-100/50">
            <div className="container mx-auto flex items-center justify-between max-w-7xl">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-[#FF3B30] flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-110">
                        M
                    </div>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                        MenuJá
                    </span>
                </Link>

                {/* Menu Items - Desktop */}
                <ul className="hidden lg:flex items-center gap-8 text-base font-medium text-slate-700">
                    {menuItems.map((item, i) => (
                        <li key={i}>
                            <Link
                                href={item.href}
                                className="hover:text-[#FF3B30] transition-colors"
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        asChild
                        variant="ghost"
                        className="hidden sm:flex text-slate-700 font-semibold hover:text-[#FF3B30] hover:bg-orange-50"
                    >
                        <Link href="/login">
                            Entrar
                        </Link>
                    </Button>
                    <Button
                        asChild
                        className="bg-[#FF3B30] hover:bg-[#D32F2F] text-white rounded-full font-semibold shadow-md px-6 h-11"
                    >
                        <Link href="/signup">
                            Começar grátis
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
