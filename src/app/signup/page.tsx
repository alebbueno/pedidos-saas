'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const validateForm = () => {
        if (!name.trim()) {
            setError('Por favor, informe seu nome')
            return false
        }
        if (!email.trim() || !email.includes('@')) {
            setError('Por favor, informe um email válido')
            return false
        }
        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres')
            return false
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return false
        }
        return true
    }

    const handleSignup = async () => {
        setError('')

        if (!validateForm()) {
            return
        }

        setLoading(true)

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                        Pedidos SaaS
                    </h1>
                    <p className="text-gray-600 mt-2">Crie sua conta e comece grátis</p>
                </div>

                <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80">
                    <CardHeader className="text-center space-y-2 pb-4">
                        <CardTitle className="text-2xl">Criar Conta</CardTitle>
                        <CardDescription>
                            Preencha seus dados para começar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">Conta criada! Redirecionando...</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Seu nome"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="h-11 transition-all focus:ring-2 focus:ring-orange-500"
                                disabled={loading || success}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="h-11 transition-all focus:ring-2 focus:ring-orange-500"
                                disabled={loading || success}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="h-11 transition-all focus:ring-2 focus:ring-orange-500"
                                disabled={loading || success}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Digite a senha novamente"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="h-11 transition-all focus:ring-2 focus:ring-orange-500"
                                disabled={loading || success}
                            />
                        </div>

                        <Button
                            className="w-full h-11 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                            onClick={handleSignup}
                            disabled={loading || success}
                        >
                            {loading ? 'Criando conta...' : success ? 'Conta criada!' : 'Criar Conta'}
                        </Button>

                        <div className="text-center pt-4 border-t">
                            <p className="text-sm text-gray-600">
                                Já tem uma conta?{' '}
                                <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">
                                    Fazer login
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Ao criar uma conta, você concorda com nossos Termos de Uso
                </p>
            </div>
        </div>
    )
}
