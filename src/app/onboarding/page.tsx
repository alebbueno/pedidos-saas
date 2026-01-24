'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout'
import { Step1RestaurantInfo } from '@/components/onboarding/step1-restaurant-info'
import { Step2Customization } from '@/components/onboarding/step2-customization'
import { Step3PaymentDelivery } from '@/components/onboarding/step3-payment-delivery'
import { Step4BusinessHours } from '@/components/onboarding/step4-business-hours'
import { Step5MenuCategory } from '@/components/onboarding/step5-menu-category'
import { Step6FirstProduct } from '@/components/onboarding/step6-first-product'
import {
    createRestaurantBasicInfo,
    updateRestaurantCustomization,
    updatePaymentAndDelivery,
    updateBusinessHours,
    createFirstCategory,
    createFirstProduct,
    completeOnboarding
} from '@/actions/onboarding-actions'

const STEPS = [
    'Informações',
    'Personalização',
    'Pagamento',
    'Horários',
    'Categoria',
    'Produto'
]

export default function OnboardingPage() {
    const router = useRouter()
    const supabase = createClient()
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [categoryId, setCategoryId] = useState<string | null>(null)

    // Step 1 data
    const [step1Data, setStep1Data] = useState({
        name: '',
        slug: '',
        whatsapp: '',
        description: '',
        // Address fields
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
    })

    // Step 2 data
    const [step2Data, setStep2Data] = useState({
        logoUrl: '',
        primaryColor: '#FF3B30',
        secondaryColor: '#FF9500'
    })

    // Step 3 data
    const [step3Data, setStep3Data] = useState({
        paymentMethods: {
            cash: true,
            pix: true,
            credit: true,
            debit: true,
            voucher: false
        },
        deliveryFee: '5.00',
        minimumOrderValue: '0.00'
    })

    // Step 4 data
    const [step4Data, setStep4Data] = useState({
        monday: { open: '09:00', close: '22:00', enabled: true },
        tuesday: { open: '09:00', close: '22:00', enabled: true },
        wednesday: { open: '09:00', close: '22:00', enabled: true },
        thursday: { open: '09:00', close: '22:00', enabled: true },
        friday: { open: '09:00', close: '22:00', enabled: true },
        saturday: { open: '09:00', close: '22:00', enabled: true },
        sunday: { open: '09:00', close: '22:00', enabled: true }
    })

    // Step 5 data
    const [step5Data, setStep5Data] = useState({
        name: '',
        description: ''
    })

    // Step 6 data
    const [step6Data, setStep6Data] = useState({
        name: '',
        description: '',
        basePrice: '',
        imageUrl: ''
    })

    // Check if user already has a restaurant
    useEffect(() => {
        const checkExistingRestaurant = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id, onboarding_completed')
                .eq('owner_id', user.id)
                .single()

            if (restaurant?.onboarding_completed) {
                router.push('/dashboard')
            }
        }

        checkExistingRestaurant()
    }, [])

    // Validation functions
    const canProceedFromStep1 = () => {
        return step1Data.name.trim() !== '' &&
            step1Data.slug.trim() !== '' &&
            step1Data.whatsapp.trim() !== '' &&
            step1Data.cep.trim() !== '' &&
            step1Data.street.trim() !== '' &&
            step1Data.number.trim() !== '' &&
            step1Data.neighborhood.trim() !== '' &&
            step1Data.city.trim() !== '' &&
            step1Data.state.trim() !== ''
    }

    const canProceedFromStep2 = () => {
        return step2Data.primaryColor !== '' && step2Data.secondaryColor !== ''
    }

    const canProceedFromStep3 = () => {
        const hasPaymentMethod = Object.values(step3Data.paymentMethods).some(v => v)
        return hasPaymentMethod && step3Data.deliveryFee !== ''
    }

    const canProceedFromStep4 = () => {
        const hasOpenDay = Object.values(step4Data).some(day => day.enabled)
        return hasOpenDay
    }

    const canProceedFromStep5 = () => {
        return step5Data.name.trim() !== ''
    }

    const canProceedFromStep6 = () => {
        return step6Data.name.trim() !== '' && step6Data.basePrice !== ''
    }

    const canGoNext = () => {
        switch (currentStep) {
            case 1: return canProceedFromStep1()
            case 2: return canProceedFromStep2()
            case 3: return canProceedFromStep3()
            case 4: return canProceedFromStep4()
            case 5: return canProceedFromStep5()
            case 6: return canProceedFromStep6()
            default: return false
        }
    }

    // Handle next button
    const handleNext = async () => {
        setIsLoading(true)

        try {
            switch (currentStep) {
                case 1:
                    const result1 = await createRestaurantBasicInfo(step1Data)
                    if (!result1.success) {
                        alert(result1.error)
                        setIsLoading(false)
                        return
                    }
                    setRestaurantId(result1.restaurantId!)
                    break

                case 2:
                    if (!restaurantId) return
                    const result2 = await updateRestaurantCustomization(restaurantId, step2Data)
                    if (!result2.success) {
                        alert(result2.error)
                        setIsLoading(false)
                        return
                    }
                    break

                case 3:
                    if (!restaurantId) return
                    const result3 = await updatePaymentAndDelivery(restaurantId, step3Data)
                    if (!result3.success) {
                        alert(result3.error)
                        setIsLoading(false)
                        return
                    }
                    break

                case 4:
                    if (!restaurantId) return
                    const result4 = await updateBusinessHours(restaurantId, step4Data)
                    if (!result4.success) {
                        alert(result4.error)
                        setIsLoading(false)
                        return
                    }
                    break

                case 5:
                    if (!restaurantId) return
                    const result5 = await createFirstCategory(restaurantId, step5Data)
                    if (!result5.success) {
                        alert(result5.error)
                        setIsLoading(false)
                        return
                    }
                    setCategoryId(result5.categoryId!)
                    break

                case 6:
                    if (!restaurantId || !categoryId) return
                    const result6 = await createFirstProduct(restaurantId, categoryId, step6Data)
                    if (!result6.success) {
                        alert(result6.error)
                        setIsLoading(false)
                        return
                    }

                    // Complete onboarding
                    await completeOnboarding(restaurantId)
                    router.push('/dashboard')
                    return
            }

            setCurrentStep(currentStep + 1)
        } catch (error) {
            console.error('Error in onboarding:', error)
            alert('Ocorreu um erro. Por favor, tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    // Handle skip (only for step 6)
    const handleSkip = async () => {
        if (currentStep === 6 && restaurantId) {
            setIsLoading(true)
            await completeOnboarding(restaurantId)
            router.push('/dashboard')
        }
    }

    // Render current step
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1RestaurantInfo data={step1Data} onChange={setStep1Data} />
            case 2:
                return <Step2Customization data={step2Data} onChange={setStep2Data} />
            case 3:
                return <Step3PaymentDelivery data={step3Data} onChange={setStep3Data} />
            case 4:
                return <Step4BusinessHours data={step4Data} onChange={setStep4Data} />
            case 5:
                return <Step5MenuCategory data={step5Data} onChange={setStep5Data} />
            case 6:
                return <Step6FirstProduct data={step6Data} onChange={setStep6Data} categoryName={step5Data.name} />
            default:
                return null
        }
    }

    return (
        <OnboardingLayout
            currentStep={currentStep}
            totalSteps={6}
            steps={STEPS}
            onNext={handleNext}
            onBack={() => setCurrentStep(currentStep - 1)}
            onSkip={currentStep === 6 ? handleSkip : undefined}
            canGoNext={canGoNext()}
            canGoBack={currentStep > 1}
            canSkip={currentStep === 6}
            isLoading={isLoading}
        >
            {renderStep()}
        </OnboardingLayout>
    )
}
