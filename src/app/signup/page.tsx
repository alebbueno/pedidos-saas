'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, ArrowRight, Zap, Star } from 'lucide-react'

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
        <div className="min-h-screen flex">
            {/* Left Column - Image (60%) */}
            <div className="hidden lg:flex lg:w-[60%] bg-[#FFC107] relative overflow-hidden items-center justify-center">
                {/* Background Image Placeholder */}
                <div
                    className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-multiply"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2574&auto=format&fit=crop)' }}
                ></div>

                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B30]/80 to-[#FFC107]/80 opacity-90"></div>

                {/* Back to Home Button */}
                <Link
                    href="/"
                    className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span className="text-sm font-medium">Voltar para o site</span>
                </Link>

                <div className="relative z-10 p-12 text-white max-w-2xl">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#FF3B30] font-bold text-3xl mb-8 shadow-xl">
                        M
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                        Comece a vender sem taxas hoje mesmo.
                    </h1>

                    <div className="space-y-6 mt-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Setup Instantâneo</h3>
                                <p className="text-white/80">Crie seu cardápio em minutos.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Teste Grátis</h3>
                                <p className="text-white/80">7 dias sem compromisso.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Form (40%) */}
            <div className="w-full lg:w-[40%] flex items-center justify-center bg-white p-8 lg:p-12">
                <div className="w-full max-w-sm space-y-8">
                    {/* Brands for Mobile */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex lg:hidden items-center gap-2 group mb-2">
                            <div className="w-10 h-10 rounded-full bg-[#FF3B30] flex items-center justify-center text-white font-bold text-xl">
                                M
                            </div>
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">
                                MenuJá
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mt-4">Criar conta grátis</h2>
                        <p className="text-slate-500 mt-2">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="text-[#FF3B30] font-semibold hover:underline">
                                Fazer login
                            </Link>
                        </p>
                    </div>

                    <div className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                Conta criada! Redirecionando...
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
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#FF3B30] focus:border-[#FF3B30] transition-all"
                                disabled={loading || success}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seunegocio@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#FF3B30] focus:border-[#FF3B30] transition-all"
                                disabled={loading || success}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="******"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#FF3B30] focus:border-[#FF3B30] transition-all"
                                    disabled={loading || success}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="******"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#FF3B30] focus:border-[#FF3B30] transition-all"
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 bg-[#FF3B30] hover:bg-[#D32F2F] text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-red-200 transition-all text-base mt-2"
                            onClick={handleSignup}
                            disabled={loading || success}
                        >
                            {loading ? 'Criando conta...' : (
                                <span className="flex items-center gap-2">
                                    Começar agora <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-6 px-4">
                        Ao criar uma conta, você concorda com nossos <Link href="#" className="underline hover:text-slate-600">Termos de Uso</Link> e <Link href="#" className="underline hover:text-slate-600">Política de Privacidade</Link>.
                    </p>
                </div>
            </div>
        </div>
    )
}
