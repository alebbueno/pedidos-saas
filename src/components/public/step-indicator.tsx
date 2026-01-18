'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
    number: number
    title: string
    description: string
}

interface StepIndicatorProps {
    steps: Step[]
    currentStep: number
    primaryColor?: string
}

export default function StepIndicator({ steps, currentStep, primaryColor = '#F97316' }: StepIndicatorProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                    <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                            backgroundColor: primaryColor
                        }}
                    />
                </div>

                {/* Steps */}
                {steps.map((step) => {
                    const isCompleted = step.number < currentStep
                    const isCurrent = step.number === currentStep
                    const isUpcoming = step.number > currentStep

                    return (
                        <div key={step.number} className="flex flex-col items-center flex-1">
                            {/* Step Circle */}
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 relative z-10",
                                    isCompleted && "text-white shadow-lg scale-110",
                                    isCurrent && "text-white shadow-xl scale-125 ring-4 ring-opacity-30",
                                    isUpcoming && "bg-gray-200 text-gray-500"
                                )}
                                style={
                                    isCompleted || isCurrent
                                        ? {
                                            backgroundColor: primaryColor,
                                            ringColor: `${primaryColor}40`
                                        }
                                        : {}
                                }
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 animate-in zoom-in duration-300" />
                                ) : (
                                    step.number
                                )}
                            </div>

                            {/* Step Label */}
                            <div className="mt-3 text-center hidden md:block">
                                <p
                                    className={cn(
                                        "text-sm font-semibold transition-colors",
                                        isCurrent && "font-bold",
                                        isUpcoming && "text-gray-400"
                                    )}
                                    style={isCurrent ? { color: primaryColor } : {}}
                                >
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                            </div>

                            {/* Mobile Label - Only show current step */}
                            {isCurrent && (
                                <div className="mt-3 text-center md:hidden">
                                    <p className="text-sm font-bold" style={{ color: primaryColor }}>
                                        {step.title}
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
