import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Play, Star } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function HeroNew() {
    return (
        <section className="relative bg-[#FFF9F2] pt-12 pb-20 overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Text */}
                    <div className="text-center lg:text-left space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/50 border border-orange-200 text-orange-600 text-sm font-medium animate-fade-in-up">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                            7 dias grátis para testar
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                            Seu delivery próprio, <br />
                            <span className="text-[#FF3B30]">sem taxas</span> e direto no WhatsApp
                        </h1>

                        <p className="text-xl text-slate-600 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Crie seu cardápio digital, receba pedidos online e automatize o atendimento do seu restaurante em poucos minutos.
                        </p>

                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Button asChild size="lg" className="h-14 px-10 bg-[#FF3B30] hover:bg-[#D32F2F] text-white text-lg font-bold rounded-full shadow-lg shadow-red-200 transition-transform hover:scale-105">
                                <Link href="/signup">
                                    Começar grátis agora <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-14 px-10 border-slate-300 text-slate-700 text-lg font-medium rounded-full hover:bg-white hover:text-[#FF3B30]">
                                <Link href="#demo">
                                    Ver demonstração
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Image Placeholder */}
                    <div className="relative">
                        {/* Placeholder for the delivery guy image */}
                        <div className="relative z-10 w-full aspect-square bg-orange-50 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-2xl">
                            <div className="text-center p-8">
                                <span className="text-8xl">🚀</span>
                                <p className="mt-4 text-slate-400 font-medium text-lg">Imagem do Produto/Entregador</p>
                            </div>
                        </div>

                        {/* Decorative background blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-200/40 to-yellow-200/40 blur-3xl rounded-full -z-10"></div>
                    </div>

                </div>

                {/* Features Strip */}
                <div className="mt-20 lg:mt-32 w-full bg-white rounded-3xl shadow-xl shadow-orange-100/50 p-8 md:p-12 border border-orange-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-center gap-3 px-4">
                            <div className="bg-green-100 p-3 rounded-full mb-2">
                                <Check className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="font-bold text-slate-800 text-lg">Sem taxas por pedido</span>
                            <p className="text-slate-500 text-sm">Fique com 100% do seu lucro</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col items-center gap-3 px-4 pt-8 md:pt-0">
                            <div className="bg-green-100 p-3 rounded-full mb-2">
                                <Check className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="font-bold text-slate-800 text-lg">Funciona no WhatsApp</span>
                            <p className="text-slate-500 text-sm">Automação completa</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col items-center gap-3 px-4 pt-8 md:pt-0">
                            <div className="bg-green-100 p-3 rounded-full mb-2">
                                <Check className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="font-bold text-slate-800 text-lg">Cancelamento fácil</span>
                            <p className="text-slate-500 text-sm">Sem fidelidade, cancele quando quiser</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
