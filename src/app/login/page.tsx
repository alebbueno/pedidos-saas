'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            // If sign in fails, try sign up (Simplified for MVP)
            const { error: signUpError } = await supabase.auth.signUp({ email, password })
            if (signUpError) {
                alert(error.message)
            } else {
                alert('Conta criada! Verifique seu email ou entre.')
            }
        } else {
            router.push('/dashboard')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Acessar Painel</CardTitle>
                    <CardDescription>Entre ou crie sua conta para gerenciar seu restaurante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleLogin} disabled={loading}>
                        {loading ? 'Carregando...' : 'Entrar / Cadastrar'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
