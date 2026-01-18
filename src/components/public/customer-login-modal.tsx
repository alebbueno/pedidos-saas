'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCustomerStore } from '@/store/customer-store'
import { getCustomerByPhone, getCustomerAddresses } from '@/actions/customer'
import { Loader2, Phone, User } from 'lucide-react'

interface CustomerLoginModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function CustomerLoginModal({ open, onOpenChange }: CustomerLoginModalProps) {
    const [phone, setPhone] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const login = useCustomerStore((state) => state.login)
    const setAddresses = useCustomerStore((state) => state.setAddresses)

    // Phone mask function
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 2) return numbers
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }

    const handlePhoneChange = (value: string) => {
        setPhone(formatPhone(value))
        setError('')
    }

    const handleLogin = async () => {
        const numbersOnly = phone.replace(/\D/g, '')

        if (numbersOnly.length < 10) {
            setError('Digite um telefone válido')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const result = await getCustomerByPhone(numbersOnly)

            if (result.success && result.customer) {
                // Customer found, log in
                login(result.customer)

                // Load addresses
                const addressResult = await getCustomerAddresses(result.customer.id)
                if (addressResult.success && addressResult.addresses) {
                    setAddresses(addressResult.addresses)
                }

                onOpenChange(false)
                setPhone('')
            } else {
                setError('Telefone não encontrado. Faça seu primeiro pedido para criar uma conta!')
            }
        } catch (err) {
            setError('Erro ao fazer login. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Entrar na sua conta
                    </DialogTitle>
                    <DialogDescription>
                        Digite seu telefone para acessar seus pedidos e perfil
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            WhatsApp (com DDD)
                        </Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="(11) 99999-9999"
                            className="h-12 text-lg"
                            maxLength={15}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleLogin()
                                }
                            }}
                        />
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>

                    <Button
                        onClick={handleLogin}
                        disabled={isLoading || phone.replace(/\D/g, '').length < 10}
                        className="w-full h-12"
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                        Não tem conta? Faça seu primeiro pedido para criar uma automaticamente!
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
