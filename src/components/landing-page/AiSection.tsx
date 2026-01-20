import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Zap, Clock } from "lucide-react";
import Link from "next/link";

export function AiSection() {
    return (
        <section className="py-24 overflow-hidden relative bg-slate-900" id="ia">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-3xl"></div>
                <div className="absolute bottom-[0%] left-[0%] w-[40%] h-[40%] rounded-full bg-orange-500/10 blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
                            <Bot className="w-4 h-4" />
                            <span>Disponível no Plano Smart</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Deixe a IA atender seus clientes no <span className="text-green-400">WhatsApp</span>
                        </h2>

                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            Seu atendente virtual entende o cardápio, conversa com o cliente, monta o pedido e registra tudo no sistema — <span className="text-white font-semibold">24h por dia, sem parar</span>.
                        </p>

                        <div className="space-y-6 mb-10">
                            {[
                                { icon: <MessageSquare className="w-5 h-5" />, text: "Responde dúvidas sobre produtos" },
                                { icon: <Zap className="w-5 h-5" />, text: "Confirma pedidos automaticamente" },
                                { icon: <Clock className="w-5 h-5" />, text: "Atendimento imediato, sem filas" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-slate-200">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700">
                                        {item.icon}
                                    </div>
                                    <span className="font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" asChild className="bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                            <Link href="/signup">Quero automatizar meu delivery</Link>
                        </Button>
                    </div>

                    <div className="lg:w-1/2 w-full">
                        <div className="relative">
                            {/* Phone Mockup Placeholder */}
                            <div className="mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                                <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                                <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                                <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[#E5DDD5] relative flex flex-col">
                                    {/* WhatsApp Chat UI header */}
                                    <div className="bg-[#075E54] p-4 flex items-center gap-3 text-white">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Atendente Virtual</div>
                                            <div className="text-xs opacity-80">Online</div>
                                        </div>
                                    </div>

                                    {/* Chat messages */}
                                    <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
                                        <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-sm max-w-[85%] text-sm text-gray-800">
                                            Olá! Bem-vindo ao Burger King! 🍔
                                            Gostaria de ver o cardápio?
                                        </div>
                                        <div className="bg-[#DCF8C6] ml-auto p-2.5 rounded-lg rounded-tr-none shadow-sm max-w-[85%] text-sm text-gray-800">
                                            Quero ver os combos, por favor.
                                        </div>
                                        <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-sm max-w-[85%] text-sm text-gray-800">
                                            Certo! Temos estas opções hoje:
                                            1. X-Salada + Refri
                                            2. X-Bacon Artesanal

                                            Qual você prefere?
                                        </div>
                                    </div>

                                    {/* Input area */}
                                    <div className="p-2 bg-[#F0F0F0] flex items-center gap-2">
                                        <div className="flex-1 h-9 bg-white rounded-full"></div>
                                        <div className="w-9 h-9 bg-[#075E54] rounded-full flex items-center justify-center text-white">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
