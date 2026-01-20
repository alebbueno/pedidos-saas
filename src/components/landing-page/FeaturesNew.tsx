import { Button } from "@/components/ui/button";
import { Check, Smartphone, BarChart3, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function FeaturesNew() {
    return (
        <section className="py-20 lg:py-32 bg-[#FFF9F2] overflow-hidden" id="features">
            <div className="container mx-auto px-4 max-w-7xl space-y-32">

                {/* Feature 1: Cardápio Digital (Payment/App visual style) */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Image Column */}
                    <ScrollReveal animation="fade-in-right" className="relative order-2 lg:order-1">
                        {/* Decorative Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[#FFC107]/20 blur-3xl rounded-full -z-10"></div>

                        {/* Mockup Placeholder */}
                        <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl flex flex-col items-center justify-start overflow-hidden transform rotate-[-2deg]">
                            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
                                {/* Screen Content: Menu Interface */}
                                <div className="p-0 h-full overflow-hidden flex flex-col">
                                    <div className="h-40 bg-orange-100 w-full relative">
                                        <div className="absolute bottom-4 left-4 flex gap-3 items-end">
                                            <div className="w-16 h-16 bg-white rounded-lg shadow-sm"></div>
                                            <div className="mb-1">
                                                <div className="h-4 w-24 bg-white/50 rounded mb-1"></div>
                                                <div className="h-3 w-16 bg-white/50 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-4 flex-1 bg-white">
                                        <div className="flex gap-2 mb-4 overflow-x-auto">
                                            <div className="w-20 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">Burgers</div>
                                            <div className="w-20 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">Bebidas</div>
                                            <div className="w-20 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">Combos</div>
                                        </div>
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex gap-3 border rounded-xl p-3 border-slate-50 shadow-sm">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                                                        <div className="h-3 w-full bg-slate-50 rounded"></div>
                                                        <div className="h-3 w-1/4 bg-green-50 text-green-600 text-xs rounded px-1">R$ 25,00</div>
                                                    </div>
                                                    <div className="w-20 h-20 bg-slate-100 rounded-lg"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Text Column */}
                    <ScrollReveal animation="fade-in-left" className="order-1 lg:order-2">
                        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                            <Smartphone className="w-7 h-7 text-[#FF3B30]" />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-[#FF3B30] mb-6 leading-tight">
                            Cardápio digital <br />bonito e rápido
                        </h2>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                            Seus clientes acessam pelo celular sem instalar nada.
                        </h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Esqueça PDFs e cardápios difíceis de ler. Ofereça uma experiência de compra incrível onde seu cliente monta o pedido sozinho, escolhe adicionais e envia tudo pronto.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center text-slate-700 font-medium">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                Seu menu 100% online
                            </li>
                            <li className="flex items-center text-slate-700 font-medium">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                Atualização em segundos
                            </li>
                            <li className="flex items-center text-slate-700 font-medium">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                Link exclusivo para divulgar
                            </li>
                        </ul>
                    </ScrollReveal>
                </div>

                {/* Feature 2: Gestão Completa */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Text Column */}
                    <ScrollReveal animation="fade-in-right">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                            <BarChart3 className="w-7 h-7 text-blue-600" />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-blue-600 mb-6 leading-tight">
                            Tudo em um <br />só lugar
                        </h2>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                            Gestão completa de pedidos, clientes e entregas.
                        </h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Elimine a bagunça dos pedidos manuais. Tenha controle total do seu faturamento, histórico de pedidos e base de clientes. Saiba exatamente quem compra com você.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center text-slate-700 font-medium">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                Painel administrativo simples
                            </li>
                            <li className="flex items-center text-slate-700 font-medium">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                Relatórios de vendas diários
                            </li>
                            <li className="flex items-center text-slate-700 font-medium">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                Cadastro automático de clientes
                            </li>
                        </ul>
                    </ScrollReveal>

                    {/* Image Column */}
                    <ScrollReveal animation="fade-in-left" className="relative">
                        {/* Decorative Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-100/50 blur-3xl rounded-full -z-10"></div>

                        {/* Mockup Placeholder - Dashboard view */}
                        <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-xl h-[400px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col transform rotate-2">
                            <div className="bg-slate-900 w-full h-6 flex items-center px-4 gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex-1 bg-slate-50 p-6 space-y-4 overflow-hidden">
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                                        <div className="text-xs text-slate-400 uppercase">Vendas Hoje</div>
                                        <div className="text-2xl font-bold text-slate-800">R$ 1.250</div>
                                    </div>
                                    <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                                        <div className="text-xs text-slate-400 uppercase">Pedidos</div>
                                        <div className="text-2xl font-bold text-slate-800">24</div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="font-bold text-slate-700">Últimos Pedidos</div>
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                                                <div>
                                                    <div className="font-medium text-slate-900">Pedido #{100 + i}</div>
                                                    <div className="text-slate-500">João Silva</div>
                                                </div>
                                                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Pago</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Feature 3: AI / Automation */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Image Column */}
                    <ScrollReveal animation="fade-in-right" className="relative order-2 lg:order-1">
                        {/* Decorative Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-purple-100/50 blur-3xl rounded-full -z-10"></div>

                        {/* Mockup Placeholder */}
                        <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl flex flex-col items-center justify-start overflow-hidden transform rotate-[-3deg]">
                            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[#E5DDD5] relative flex flex-col">
                                {/* WhatsApp Style Interface */}
                                <div className="bg-[#075E54] h-16 w-full flex items-center px-4 text-white font-bold shadow-sm z-10">
                                    MenuJá Bot
                                </div>
                                <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
                                    {/* Messages */}
                                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%] self-start text-sm">
                                        Olá! Gostaria de fazer um pedido. 🍔
                                    </div>
                                    <div className="bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%] ml-auto text-sm">
                                        Oi! Claro. Aqui está nosso cardápio digital: <span className="text-blue-500 underline">link.do/cardapio</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%] self-start text-sm mt-4">
                                        Escolhi um X-Bacon e uma Coca.
                                    </div>
                                    <div className="bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%] ml-auto text-sm">
                                        Perfeito! Seu pedido #1023 foi confirmado. Tempo estimado: 40 min. 🛵
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Text Column */}
                    <ScrollReveal animation="fade-in-left" className="order-1 lg:order-2">
                        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                            <Zap className="w-7 h-7 text-purple-600" />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-purple-600 mb-6 leading-tight">
                            Atendimento via <br />WhatsApp com IA
                        </h2>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                            Receba pedidos organizados direto no seu WhatsApp.
                        </h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Nossa Inteligência Artificial atende 24h por dia, tira dúvidas e registra pedidos sozinha. Você não perde vendas nem quando estiver ocupado.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center text-slate-700 font-medium">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                Atende múltiplos clientes ao mesmo tempo
                            </li>
                            <li className="flex items-center text-slate-700 font-medium">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                Envia o pedido pronto para a cozinha
                            </li>
                            <li className="flex items-center text-slate-700 font-medium">
                                <Check className="w-5 h-5 text-green-500 mr-3" />
                                Disponível no plano Smart
                            </li>
                        </ul>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}


