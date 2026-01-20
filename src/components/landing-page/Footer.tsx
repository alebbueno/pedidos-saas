import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <span className="text-xl font-bold text-white block mb-2">Pedidos SaaS</span>
                        <p className="text-sm text-slate-400">
                            © {new Date().getFullYear()} Pedidos SaaS. Todos os direitos reservados.
                        </p>
                    </div>

                    <div className="flex gap-6 text-sm font-medium">
                        <Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link>
                        <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
                        <Link href="#" className="hover:text-white transition-colors">Contato</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
