'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
    currentStep: number
    totalSteps: number
    steps: string[]
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            {/* Mobile: Simple progress bar */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">
                        Etapa {currentStep} de {totalSteps}
                    </span>
                    <span className="text-sm font-medium text-orange-600">
                        {Math.round((currentStep / totalSteps) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Desktop: Full step indicator */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    const isCompleted = stepNumber < currentStep
                    const isCurrent = stepNumber === currentStep
                    const isUpcoming = stepNumber > currentStep

                    return (
                        <div key={stepNumber} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300',
                                        isCompleted && 'bg-green-500 text-white shadow-lg shadow-green-200',
                                        isCurrent && 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110',
                                        isUpcoming && 'bg-slate-200 text-slate-400'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'mt-2 text-xs font-medium text-center max-w-[100px]',
                                        isCurrent && 'text-orange-600',
                                        isCompleted && 'text-green-600',
                                        isUpcoming && 'text-slate-400'
                                    )}
                                >
                                    {step}
                                </span>
                            </div>

                            {/* Connecting Line */}
                            {stepNumber < totalSteps && (
                                <div
                                    className={cn(
                                        'flex-1 h-1 mx-2 transition-all duration-300',
                                        stepNumber < currentStep ? 'bg-green-500' : 'bg-slate-200'
                                    )}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
