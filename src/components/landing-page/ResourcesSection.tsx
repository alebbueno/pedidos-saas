import {
    ClipboardList,
    ShoppingCart,
    Users,
    Package,
    BarChart3,
    Bot
} from "lucide-react";

export function ResourcesSection() {
    const resources = [
        {
            icon: <ClipboardList className="w-8 h-8 text-orange-500" />,
            title: "Cardápio Digital",
            items: ["Seu menu online", "Atualização em segundos", "Link pronto para divulgar"]
        },
        {
            icon: <ShoppingCart className="w-8 h-8 text-orange-500" />,
            title: "Pedido Online",
            items: ["Cliente escolhe e monta", "Com variações e opções", "Experiência fluida"]
        },
        {
            icon: <Users className="w-8 h-8 text-orange-500" />,
            title: "Gestão de Clientes",
            items: ["Cadastro automático", "Histórico de pedidos", "Fidelização simplificada"]
        },
        {
            icon: <Package className="w-8 h-8 text-orange-500" />,
            title: "Gestão de Pedidos",
            items: ["Acompanhe em tempo real", "Status: novo, preparo, entrega", "Organização total"]
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-orange-500" />,
            title: "Faturamento",
            items: ["Total do dia e mês", "Ticket médio", "Relatórios simples"]
        },
        {
            icon: <Bot className="w-8 h-8 text-indigo-500" />,
            title: "IA no WhatsApp",
            items: ["Atende 24h por dia", "Registra pedidos sozinho", "Disponível no plano Smart"],
            highlight: true
        }
    ];

    return (
        <section className="py-20 bg-slate-50" id="recursos">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-orange-600 font-semibold tracking-wide uppercase text-sm">Recursos Principais</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">
                        Tudo o que você precisa para crescer
                    </h2>
                    <p className="text-lg text-slate-600">
                        Ferramentas essenciais para profissionalizar seu delivery e ganhar tempo.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resources.map((resource, i) => (
                        <div
                            key={i}
                            className={`bg-white p-8 rounded-2xl shadow-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${resource.highlight ? 'border-indigo-100 ring-2 ring-indigo-50' : 'border-slate-100'}`}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${resource.highlight ? 'bg-indigo-100' : 'bg-orange-50'}`}>
                                {resource.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{resource.title}</h3>
                            <ul className="space-y-3">
                                {resource.items.map((item, j) => (
                                    <li key={j} className="flex items-center text-slate-600 text-sm">
                                        <span className={`w-1.5 h-1.5 rounded-full mr-3 ${resource.highlight ? 'bg-indigo-400' : 'bg-orange-400'}`}></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
