"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Utensils, Coffee, Pizza } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function FaqNew() {
    const faqs = [
        { question: "Preciso ter CNPJ?", answer: "Não é necessário! É possível se registrar tanto como empresa (com CNPJ), quanto como pessoa física, ou seja, apenas com o seu CPF." },
        { question: "Quantos o pede.ai cobra do estabelecimento?", answer: "O pede.ai não cobra comissão sobre suas vendas. Você paga apenas o valor fixo da assinatura mensal do seu plano escolhido. 100% do lucro é seu." },
        { question: "Como funciona a Exclusividade pede.ai?", answer: "Não exigimos exclusividade. Você é livre para vender em outros apps, telefone ou balcão. O pede.ai vem para somar e automatizar seu atendimento." },
        { question: "O pede.ai tem serviço de entrega de pedidos?", answer: "Atualmente focamos na tecnologia para gestão e vendas. A entrega fica por conta do estabelecimento, permitindo que você tenha controle total sobre a qualidade e raio de entrega." },
        { question: "Como funciona os cupons de descontos?", answer: "Você tem autonomia total para criar e gerenciar seus cupons. Defina valor (R$ ou %), validade, e regras de uso direto no seu painel administrativo." },
    ];

    return (
        <section className="py-20 bg-white" id="faq">
            <div className="container mx-auto px-4 max-w-3xl">

                {/* Partner Strip (Grayscale) - Visual Trust */}
                <ScrollReveal animation="fade-in-up" delay={0}>
                    <div className="mb-20 text-center">
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
                            Integração e Tecnologia
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="text-3xl font-black text-slate-300">BAIXO</div>
                            <div className="text-3xl font-black text-slate-300">Bob&apos;s</div>
                            <div className="text-2xl font-serif italic text-slate-300">Pepetino</div>
                            <div className="text-3xl font-bold text-slate-300">Sushi</div>
                            <div className="text-3xl font-black text-slate-300">SUBWAY</div>
                            <div className="text-3xl font-black text-slate-300">PizzaHut</div>
                            <div className="text-3xl font-black text-slate-300">+PREÇO</div>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-in-up" delay={200}>
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Perguntas <span className="text-[#FF3B30]">frequentes</span>
                        </h2>
                        <p className="text-lg text-slate-600">
                            Tire suas dúvidas e comece a vender hoje mesmo.
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-in-up" delay={400}>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, i) => (
                            <FaqItem key={i} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-slate-50/50 transition-colors"
            >
                <span className="font-bold text-slate-800 text-lg">{question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {isOpen && (
                <div className="p-6 pt-0 bg-white text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                    {answer}
                </div>
            )}
        </div>
    );
}
