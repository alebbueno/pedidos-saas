'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async () => {
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError('Email ou senha incorretos')
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                        Pedidos SaaS
                    </h1>
                    <p className="text-gray-600 mt-2">Entre para gerenciar seu negócio</p>
                </div>

                <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80">
                    <CardHeader className="text-center space-y-2 pb-4">
                        <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
                        <CardDescription>
                            Acesse sua conta para continuar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-11 transition-all focus:ring-2 focus:ring-orange-500"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-orange-600 hover:text-orange-700 hover:underline"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Sua senha"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-11 transition-all focus:ring-2 focus:ring-orange-500"
                                disabled={loading}
                            />
                        </div>

                        <Button
                            className="w-full h-11 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>

                        <div className="text-center pt-4 border-t">
                            <p className="text-sm text-gray-600">
                                Ainda não tem conta?{' '}
                                <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">
                                    Criar conta grátis
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-500 mt-6">
                    &copy; {new Date().getFullYear()} Pedidos SaaS. Todos os direitos reservados.
                </p>
            </div>
        </div>
    )
}
