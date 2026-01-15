import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col">
      <header className="p-6 flex justify-between items-center container mx-auto">
        <h1 className="text-2xl font-bold text-primary">Pedidos SaaS</h1>
        <Link href="/login">
          <Button>Entrar</Button>
        </Link>
      </header>

      <main className="flex-1 container mx-auto flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-5xl font-extrabold tracking-tight mb-6">
          Seu Restaurante, <span className="text-primary">Suas Regras</span>.
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mb-10">
          Cardápio online, pedidos via WhatsApp sem taxas e Atendimento com IA.
          Tudo o que você precisa para vender mais.
        </p>
        <div className="flex gap-4">
          <Link href="/login?mode=signup">
            <Button size="lg" className="h-12 px-8 text-lg">Começar Grátis</Button>
          </Link>
          <Link href="/lp/demo-pizza">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">Ver Demonstração</Button>
          </Link>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-500 text-sm">
        © 2024 Pedidos SaaS. Feito para pequenos negócios.
      </footer>
    </div>
  )
}
