export function ProblemSection() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        Cansado de pagar taxas altas para vender o que já é seu?
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                        Marketplaces complicam, cobram caro e afastam você do seu cliente.
                        <br className="hidden md:block" />
                        Com nosso sistema, o pedido é direto com você,{" "}
                        <span className="font-semibold text-orange-600">sem intermediários</span>.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mt-12">
                        {[
                            { title: "Taxas Abusivas", desc: "Pare de perder uma fatia grande do seu lucro em cada venda." },
                            { title: "Concorrência Desleal", desc: "Seu cliente vê seu prato ao lado de dezenas de outros." },
                            { title: "Dados Ocultos", desc: "Você não tem acesso fácil aos dados do seu próprio cliente." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 font-bold text-xl">
                                    !
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
