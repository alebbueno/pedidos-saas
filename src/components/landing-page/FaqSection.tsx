"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function FaqSection() {
    const faqs = [
        { question: "Preciso pagar taxa por pedido?", answer: "Não. O Pedidos SaaS não cobra nenhuma comissão sobre suas vendas. O lucro é 100% seu." },
        { question: "Posso cancelar quando quiser?", answer: "Sim. Nossos planos são mensais e não exigem fidelidade. Você pode cancelar a qualquer momento sem custos extras." },
        { question: "Funciona para pizzaria?", answer: "Sim! Nosso sistema permite cadastrar variações (tamanhos, bordas, sabores) e adicionais, perfeito para pizzarias e hamburguerias." },
        { question: "A IA responde sozinha?", answer: "Sim. No plano Smart, o agente de IA atende seus clientes no WhatsApp, tira dúvidas e anota o pedido automaticamente." },
        { question: "Preciso de computador para usar?", answer: "Não. Todo o sistema é responsivo e você pode gerenciar seus pedidos e cardápio diretamente pelo celular." },
    ];

    return (
        <section className="py-20 bg-white" id="faq">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Perguntas Frequentes
                    </h2>
                    <p className="text-slate-600">
                        Tire suas dúvidas sobre o Pedidos SaaS.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-4">
                    {faqs.map((faq, i) => (
                        <FaqItem key={i} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-slate-50 transition-colors"
            >
                <span className="font-semibold text-slate-800">{question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            {isOpen && (
                <div className="p-4 pt-0 bg-slate-50 text-slate-600 text-sm border-t border-slate-100">
                    <div className="pt-4">{answer}</div>
                </div>
            )}
        </div>
    );
}
