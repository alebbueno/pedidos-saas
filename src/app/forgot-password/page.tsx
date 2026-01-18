'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleReset = async () => {
        if (!email.trim() || !email.includes('@')) {
            setError('Por favor, informe um email válido')
            return
        }

        setLoading(true)
        setError('')

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
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
                </div>

                <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80">
                    <CardHeader className="text-center space-y-2 pb-4">
                        <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
                        <CardDescription>
                            Digite seu email para receber um link de recuperação
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {success ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">Email enviado! Verifique sua caixa de entrada.</span>
                                </div>
                                <Link href="/login">
                                    <Button variant="outline" className="w-full mt-2">
                                        Voltar para Login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="h-11 transition-all focus:ring-2 focus:ring-orange-500"
                                        disabled={loading}
                                    />
                                </div>

                                <Button
                                    className="w-full h-11 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                                    onClick={handleReset}
                                    disabled={loading}
                                >
                                    {loading ? 'Enviando...' : 'Enviar Link'}
                                </Button>
                            </>
                        )}

                        <div className="text-center pt-4 border-t">
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar para Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
