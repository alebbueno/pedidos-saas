'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { StepIndicator } from './step-indicator'

interface OnboardingLayoutProps {
    currentStep: number
    totalSteps: number
    steps: string[]
    children: React.ReactNode
    onNext: () => void
    onBack: () => void
    onSkip?: () => void
    canGoNext: boolean
    canGoBack: boolean
    canSkip?: boolean
    isLoading?: boolean
}

export function OnboardingLayout({
    currentStep,
    totalSteps,
    steps,
    children,
    onNext,
    onBack,
    onSkip,
    canGoNext,
    canGoBack,
    canSkip = false,
    isLoading = false
}: OnboardingLayoutProps) {
    return (
        <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden">
            {/* Decorative background blob */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/30 to-yellow-200/30 blur-3xl rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-orange-100/20 to-pink-100/20 blur-3xl rounded-full -z-10" />

            <div className="container mx-auto px-4 py-8">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
                            P
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            pedidos saas.
                        </span>
                    </div>
                </div>

                {/* Step Indicator */}
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} steps={steps} />

                {/* Main Content Card */}
                <div className="max-w-3xl mx-auto mt-8">
                    <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/50 p-8 md:p-12 border border-orange-50">
                        {children}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onBack}
                            disabled={!canGoBack || isLoading}
                            className="rounded-full border-slate-300 text-slate-700 hover:bg-white hover:text-orange-600"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Voltar
                        </Button>

                        <div className="flex items-center gap-4">
                            {canSkip && onSkip && (
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={onSkip}
                                    disabled={isLoading}
                                    className="rounded-full text-slate-600 hover:text-orange-600"
                                >
                                    Pular esta etapa
                                </Button>
                            )}

                            <Button
                                size="lg"
                                onClick={onNext}
                                disabled={!canGoNext || isLoading}
                                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 transition-transform hover:scale-105"
                            >
                                {isLoading ? 'Salvando...' : currentStep === totalSteps ? 'Finalizar' : 'Próximo'}
                                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
