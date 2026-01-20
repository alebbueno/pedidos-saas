import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Star, Zap, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function PlansNew() {
    const plans = [
        {
            name: "Para quem quer começar",
            role: "Start",
            price: "49,90",
            description: "Ideal para quem está começando no delivery próprio. Tenha seu cardápio online hoje mesmo.",
            features: [
                "Cardápio digital completo",
                "Receba pedidos no WhatsApp",
                "Gestão de pedidos básica",
                "Cadastro de produtos",
                "QR Code para mesas"
            ],
            icon: <ShoppingBag className="w-6 h-6 text-[#FF3B30]" />,
            cta: "Começar grátis",
            highlight: false
        },
        {
            name: "Para quem quer crescer",
            role: "Pro",
            price: "69,90",
            description: "Mais profissional, com a sua marca em destaque e domínio próprio.",
            features: [
                "Tudo do plano Start",
                "Domínio próprio (sua marca)",
                "Sem taxas sobre pedidos",
                "Gestão de clientes (CRM)",
                "Relatórios de vendas"
            ],
            icon: <Star className="w-6 h-6 text-[#FF3B30]" />,
            cta: "Começar grátis",
            highlight: false
        },
        {
            name: "Para quem quer automação",
            role: "Smart",
            price: "129,90",
            description: "Automação total no atendimento via WhatsApp com Inteligência Artificial.",
            features: [
                "Tudo do plano Pro",
                "Agente de IA para WhatsApp",
                "Atendimento automático 24h",
                "Confirmação automática",
                "Recuperação de carrinho"
            ],
            icon: <Zap className="w-6 h-6 text-white" />,
            cta: "Começar grátis",
            highlight: true
        }
    ];

    return (
        <section className="py-20 lg:py-32 bg-[#FFC107]" id="precos">
            <div className="container mx-auto px-4 max-w-7xl">
                <ScrollReveal animation="fade-in-up">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#D32F2F] font-bold tracking-widest text-sm uppercase">
                            O MENUJÁ É PARA TODOS
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                            Quem usa, ama. Quem vende, cresce.<br />
                            Quem entrega, fatura.
                        </h2>
                    </div>
                </ScrollReveal>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                    {plans.map((plan, i) => (
                        <ScrollReveal key={i} animation="fade-in-up" delay={i * 200} className="h-full">
                            <div
                                className={`
                                    relative bg-white rounded-3xl p-8 flex flex-col transition-all duration-300 h-full
                                    ${plan.highlight
                                        ? 'shadow-2xl scale-105 z-10 border-4 border-orange-400'
                                        : 'shadow-xl hover:shadow-2xl hover:-translate-y-1'
                                    }
                                `}
                            >
                                {/* Best Value Badge */}
                                {plan.highlight && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#FF3B30] text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide shadow-lg">
                                        Mais Popular
                                    </div>
                                )}

                                {/* Plan Role & Icon */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`
                                        w-12 h-12 rounded-2xl flex items-center justify-center
                                        ${plan.highlight ? 'bg-[#FF3B30]' : 'bg-orange-50'}
                                    `}>
                                        {plan.icon}
                                    </div>
                                    <span className={`
                                        font-bold text-sm uppercase tracking-wider
                                        ${plan.highlight ? 'text-[#FF3B30]' : 'text-slate-400'}
                                    `}>
                                        {plan.role}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                                    {plan.name}
                                </h3>

                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-sm text-slate-500 font-medium">R$</span>
                                    <span className="text-4xl font-extrabold text-[#FF3B30]">{plan.price}</span>
                                    <span className="text-sm text-slate-500 font-medium">/mês</span>
                                </div>

                                <p className="text-slate-600 mb-8 text-sm leading-relaxed min-h-[60px]">
                                    {plan.description}
                                </p>

                                <div className="w-full h-px bg-slate-100 mb-8"></div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                            <div className={`
                                                p-0.5 rounded-full mt-0.5
                                                ${plan.highlight ? 'bg-orange-100' : 'bg-slate-100'}
                                            `}>
                                                <Check className={`
                                                    w-3 h-3 
                                                    ${plan.highlight ? 'text-[#FF3B30]' : 'text-slate-500'}
                                                `} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    asChild
                                    className={`
                                        w-full h-12 rounded-xl text-white font-bold text-base shadow-lg transition-all
                                        ${plan.highlight
                                            ? 'bg-[#FF3B30] hover:bg-[#D32F2F] shadow-red-200'
                                            : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                                        }
                                    `}
                                >
                                    <Link href="/signup">
                                        {plan.cta} <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
