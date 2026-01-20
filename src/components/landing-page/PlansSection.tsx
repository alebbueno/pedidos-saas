import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export function PlansSection() {
    const plans = [
        {
            name: "Start",
            price: "49,90",
            description: "Ideal para quem está começando no delivery próprio",
            features: [
                "Cardápio digital",
                "Pedido online",
                "Página: seurestaurante.nossosite.com",
                "Cadastro de produtos e variações",
                "Gestão de pedidos",
                "Cadastro de clientes",
                "Faturamento básico"
            ],
            cta: "Começar grátis",
            highlight: false
        },
        {
            name: "Pro",
            price: "69,90",
            description: "Mais profissional, com a sua marca em destaque",
            features: [
                "Tudo do plano Start",
                "Uso de domínio próprio",
                "Melhor posicionamento da marca",
                "Ideal para divulgar no Instagram"
            ],
            cta: "Começar grátis",
            highlight: false
        },
        {
            name: "Smart",
            price: "129,90",
            description: "Automação total no atendimento via WhatsApp",
            features: [
                "Tudo do plano Pro",
                "Agente de IA para WhatsApp",
                "Atendimento automático de pedidos",
                "Registro e confirmação pela IA",
                "Personalização do tom de voz",
                "Tela de testes do agente"
            ],
            cta: "Começar grátis",
            highlight: true
        }
    ];

    return (
        <section className="py-20 bg-slate-50" id="precos">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Escolha o plano ideal para o seu restaurante
                    </h2>
                    <p className="text-lg text-slate-600">
                        Teste grátis por 7 dias. Cancele quando quiser.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative bg-white rounded-2xl p-8 flex flex-col ${plan.highlight ? 'border-2 border-orange-500 shadow-xl scale-105 z-10' : 'border border-slate-200 shadow-sm hover:border-orange-200 transition-colors'}`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    MAIS VENDIDO
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-orange-600' : 'text-slate-900'}`}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-sm text-slate-500">R$</span>
                                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                                    <span className="text-sm text-slate-500">/mês</span>
                                </div>
                                <p className="text-slate-600 text-sm">{plan.description}</p>
                            </div>

                            <div className="flex-1 mb-8">
                                <ul className="space-y-4">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-3 text-sm text-slate-600">
                                            <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-orange-500' : 'text-slate-400'}`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                asChild
                                className={`w-full ${plan.highlight ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                                size="lg"
                            >
                                <Link href="/signup">{plan.cta}</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
