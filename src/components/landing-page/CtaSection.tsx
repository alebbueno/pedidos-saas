import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CtaSection() {
    return (
        <section className="py-24 bg-orange-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pattern-dots"></div>
            <div className="container mx-auto px-4 relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
                    Comece hoje e venda sem intermediários
                </h2>
                <p className="text-lg md:text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
                    Junte-se a centenas de restaurantes que já estão lucrando mais com seu próprio sistema de delivery.
                </p>

                <div className="flex flex-col items-center gap-4">
                    <Button size="lg" asChild className="bg-white text-orange-600 hover:bg-orange-50 text-lg h-14 px-10 shadow-lg font-bold">
                        <Link href="/signup">Criar meu cardápio grátis</Link>
                    </Button>
                    <p className="text-sm text-orange-200 opacity-90 mt-2">
                        Teste grátis por 7 dias. Sem cartão de crédito.
                    </p>
                </div>
            </div>
        </section>
    );
}
