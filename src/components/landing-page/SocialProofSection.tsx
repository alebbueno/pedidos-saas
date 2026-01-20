import { Rocket, Smartphone, Ban, ShieldCheck } from "lucide-react";

export function SocialProofSection() {
    const items = [
        { icon: <Rocket className="w-5 h-5 text-orange-500" />, text: "Configure em minutos" },
        { icon: <Smartphone className="w-5 h-5 text-orange-500" />, text: "Feito para celular" },
        { icon: <Ban className="w-5 h-5 text-orange-500" />, text: "Sem taxas por pedido" },
        { icon: <ShieldCheck className="w-5 h-5 text-orange-500" />, text: "Pagamento seguro com Stripe" },
    ];

    return (
        <section className="py-12 border-y border-slate-100 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                                {item.icon}
                            </div>
                            <span className="font-semibold text-slate-700">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
