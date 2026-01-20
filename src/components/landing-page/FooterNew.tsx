import Link from "next/link";
import { Instagram, Facebook, Linkedin, Youtube, Phone, Mail, MapPin } from "lucide-react";

export function FooterNew() {
    return (
        <footer className="bg-[#1a1a1a] text-white pt-24 pb-12 relative overflow-hidden">



            <div className="container mx-auto px-4 relative z-10 pt-16">
                <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-20 px-4 max-w-7xl mx-auto">

                    {/* Brand & Contact - Left Aligned */}
                    <div className="space-y-6 lg:w-1/3">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[#FF3B30] flex items-center justify-center text-white font-bold text-xl">
                                M
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">MenuJá</span>
                        </div>

                        {/* Socials */}
                        <div className="flex gap-5 mb-8">
                            <Link href="#" className="text-white hover:text-[#FF3B30] transition-colors"><Instagram className="w-5 h-5" /></Link>
                            <Link href="#" className="text-white hover:text-[#FF3B30] transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="text-white hover:text-[#FF3B30] transition-colors"><Linkedin className="w-5 h-5" /></Link>
                            <Link href="#" className="text-white hover:text-[#FF3B30] transition-colors"><Youtube className="w-5 h-5" /></Link>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4 text-sm text-gray-400 font-light tracking-wide">
                            <div className="flex items-center gap-3 hover:text-white transition-colors">
                                <Phone className="w-4 h-4 shrink-0" />
                                <span>(87) 99107-8948</span>
                            </div>
                            <div className="flex items-center gap-3 hover:text-white transition-colors">
                                <Mail className="w-4 h-4 shrink-0" />
                                <span>contato@menuja.com.br</span>
                            </div>
                            <div className="flex items-start gap-3 hover:text-white transition-colors max-w-xs">
                                <MapPin className="w-4 h-4 shrink-0 mt-1" />
                                <span>Av. das Nações, 637, Gercino Coelho, Petrolina - PE, 56306-260</span>
                            </div>
                        </div>
                    </div>

                    {/* Menu - Center Aligned (Desktop) */}
                    <div className="lg:w-1/3 flex flex-col lg:items-center">
                        <div>
                            <h3 className="text-base font-bold mb-8 text-white tracking-wide">Menu</h3>
                            <ul className="space-y-4 text-sm text-gray-400 font-medium">
                                <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
                                <li><Link href="#features" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                                <li><Link href="#precos" className="hover:text-white transition-colors">Planos</Link></li>
                                <li><Link href="#faq" className="hover:text-white transition-colors">Perguntas Frequentes</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                                <li><Link href="/signup" className="hover:text-white transition-colors">Cadastre sua loja</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Legal - Right Aligned (Desktop) */}
                    <div className="lg:w-1/3 flex flex-col lg:items-end text-left lg:text-right">
                        <div>
                            <h3 className="text-base font-bold mb-8 text-white tracking-wide">Legal</h3>
                            <ul className="space-y-4 text-sm text-gray-400 font-medium">
                                <li><Link href="#" className="hover:text-white transition-colors">Políticas de Privacidade</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Trabalhe Conosco</Link></li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar - Minimalist */}
                <div className="border-t border-white/10 pt-10 flex flex-col items-center gap-6 text-center">
                    <p className="text-[11px] text-gray-500 font-medium tracking-wide">
                        Feito com muito ❤️ e ☕ <br className="md:hidden" />
                        <span className="hidden md:inline"> • </span>
                        Todos os direitos reservados © MENUJÁ DESENVOLVIMENTO DE SOFTWARES LTDA
                    </p>
                    <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">by</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#FF3B30] flex items-center justify-center text-white font-bold text-[8px]">M</div>
                            <span className="text-xs font-bold text-gray-400">MenuJá</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
