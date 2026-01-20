import { CheckCircle2 } from "lucide-react";

export function SolutionSection() {
    const benefits = [
        {
            title: "Cardápio digital bonito e rápido",
            desc: "Seus clientes acessam pelo celular sem instalar nada."
        },
        {
            title: "Pedido online sem complicação",
            desc: "Interface simples para montar pedidos com adicionais."
        },
        {
            title: "Atendimento via WhatsApp",
            desc: "Receba pedidos organizados direto no seu WhatsApp."
        },
        {
            title: "Tudo em um só lugar",
            desc: "Gestão completa de pedidos, clientes e entregas."
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="lg:w-1/2">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 font-medium text-sm mb-6">
                            A Solução Ideal
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                            Um sistema simples para <span className="text-orange-500">vender mais</span> e atender melhor
                        </h2>
                        <p className="text-lg text-slate-600 mb-8">
                            Desenvolvido pensando na agilidade que seu delivery precisa.
                            Elimine a bagunça dos pedidos manuais e ofereça uma experiência profissional.
                        </p>

                        <div className="space-y-6">
                            {benefits.map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <CheckCircle2 className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                                        <p className="text-slate-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/2 w-full">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 aspect-square sm:aspect-video lg:aspect-square flex items-center justify-center">
                            {/* Placeholder for Solution Image/Screenshot */}
                            <div className="text-center p-8">
                                <span className="block text-6xl mb-4">📱</span>
                                <p className="text-slate-500 font-medium">Preview do Cardápio Digital</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
