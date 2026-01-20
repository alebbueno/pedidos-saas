'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowRight, Check } from 'lucide-react'

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
        <div className="min-h-screen flex">
            {/* Left Column - Image (60%) */}
            <div className="hidden lg:flex lg:w-[60%] bg-[#1E1E24] relative overflow-hidden items-center justify-center">
                {/* Background Image Placeholder */}
                <div
                    className="absolute inset-0 opacity-60 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2574&auto=format&fit=crop)' }}
                ></div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E24] via-transparent to-transparent opacity-90"></div>

                {/* Content over Image */}
                <div className="relative z-10 p-12 text-white max-w-2xl">
                    <div className="w-16 h-16 rounded-full bg-[#FF3B30] flex items-center justify-center text-white font-bold text-3xl mb-8">
                        M
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                        Gerencie seu delivery com inteligência.
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                        Junte-se a milhares de restaurantes que usam o MenuJá para vender mais e automatizar o atendimento no WhatsApp.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <Check className="w-4 h-4 text-[#FF3B30]" />
                            <span className="text-sm font-medium">Cardápio Digital</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <Check className="w-4 h-4 text-[#FF3B30]" />
                            <span className="text-sm font-medium">IA no WhatsApp</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Form (40%) */}
            <div className="w-full lg:w-[40%] flex items-center justify-center bg-white p-8 lg:p-12">
                <div className="w-full max-w-sm space-y-8">
                    {/* Brands for Mobile */}
                    <div className="text-center lg:text-left">
                        <Link href="/" className="inline-flex items-center gap-2 group mb-2">
                            <div className="w-10 h-10 rounded-full bg-[#FF3B30] flex items-center justify-center text-white font-bold text-xl lg:hidden">
                                M
                            </div>
                            <span className="text-2xl font-bold text-slate-900 tracking-tight lg:hidden">
                                MenuJá
                            </span>
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 mt-4">Bem-vindo de volta!</h2>
                        <p className="text-slate-500 mt-2">
                            Não tem uma conta?{' '}
                            <Link href="/signup" className="text-[#FF3B30] font-semibold hover:underline">
                                Crie grátis
                            </Link>
                        </p>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="exemplo@restaurante.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#FF3B30] focus:border-[#FF3B30] transition-all"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-slate-500 hover:text-[#FF3B30] transition-colors"
                                >
                                    Esqueceu?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#FF3B30] focus:border-[#FF3B30] transition-all"
                                disabled={loading}
                            />
                        </div>

                        <Button
                            className="w-full h-12 bg-[#FF3B30] hover:bg-[#D32F2F] text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-red-200 transition-all text-base"
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : (
                                <span className="flex items-center gap-2">
                                    Entrar no sistema <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-400">Protegido por SSL</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
