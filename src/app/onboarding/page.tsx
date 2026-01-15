'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleCreate = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        const { error } = await supabase.from('restaurants').insert({
            name,
            slug,
            whatsapp_number: whatsapp,
            owner_id: user.id,
            subscription_status: 'trialing'
        })

        if (error) {
            alert('Erro ao criar restaurante: ' + error.message)
        } else {
            router.push('/dashboard')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Configurar Restaurante</CardTitle>
                    <CardDescription>Vamos configurar seu espaço</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Nome do Restaurante"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <Input
                        placeholder="Link do Cardápio (slug)"
                        value={slug}
                        onChange={e => setSlug(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Seu link será: pedidos-saas.com/lp/{slug}</p>
                    <Input
                        placeholder="WhatsApp Principal"
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleCreate} disabled={loading}>
                        {loading ? 'Criando...' : 'Finalizar Setup'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
