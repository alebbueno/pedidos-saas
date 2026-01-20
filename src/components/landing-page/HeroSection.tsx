import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-orange-50/50 to-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/50 border border-orange-200 text-orange-600 text-sm font-medium mb-6 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        7 dias grátis para testar
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 animate-fade-in-up delay-100">
                        Seu delivery próprio,{" "}
                        <span className="text-orange-500">sem taxas</span> e direto no WhatsApp
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                        Crie seu cardápio digital, receba pedidos online e automatize o atendimento do seu restaurante em poucos minutos.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up delay-300">
                        <Button size="lg" asChild className="w-full sm:w-auto text-lg h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                            <Link href="/signup">Começar grátis agora</Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild className="w-full sm:w-auto text-lg h-12 px-8 hover:bg-slate-50 text-slate-600 border-slate-200">
                            <Link href="#demo">Ver demonstração</Link>
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-600 animate-fade-in-up delay-500">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-1 rounded-full">
                                <Check className="w-4 h-4 text-green-600" />
                            </div>
                            Sem taxas por pedido
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-1 rounded-full">
                                <Check className="w-4 h-4 text-green-600" />
                            </div>
                            Funciona no WhatsApp
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-1 rounded-full">
                                <Check className="w-4 h-4 text-green-600" />
                            </div>
                            Cancelamento fácil
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
