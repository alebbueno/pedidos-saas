'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    getAgentConfig,
    upsertAgentConfig,
    type AgentConfig,
    type ToneOfVoice,
} from '@/actions/agent-config-actions'
import { getToneDescription } from '@/lib/agent-utils'
import { Bot, Save, RotateCcw, Sparkles, MessageSquare, Settings, User, CheckCircle2, AlertCircle } from 'lucide-react'
import MobileSimulator from '@/components/admin/mobile-simulator'

export default function AgentConfigPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [restaurantId, setRestaurantId] = useState<string>('')
    const [config, setConfig] = useState<AgentConfig | null>(null)
    const [restaurantName, setRestaurantName] = useState<string>('')
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

    useEffect(() => {
        loadConfig()
    }, [])

    async function loadConfig() {
        try {
            const { getOwnerRestaurant } = await import('@/actions/admin')
            const restaurant = await getOwnerRestaurant()

            if (!restaurant) {
                alert('Restaurante não encontrado. Faça login novamente.')
                return
            }

            setRestaurantId(restaurant.id)
            setRestaurantName(restaurant.name)

            const { data } = await getAgentConfig(restaurant.id)
            if (data) {
                setConfig(data)
            }
        } catch (error) {
            console.error('Error loading config:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        if (!config) return

        setSaving(true)
        setSaveStatus('idle')
        try {
            await upsertAgentConfig(config)
            setSaveStatus('success')
            setTimeout(() => setSaveStatus('idle'), 3000)
        } catch (error) {
            console.error('Error saving config:', error)
            setSaveStatus('error')
            setTimeout(() => setSaveStatus('idle'), 3000)
        } finally {
            setSaving(false)
        }
    }

    function handleReset() {
        if (confirm('Deseja resetar para as configurações padrão?')) {
            loadConfig()
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Bot className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
                    <p className="text-muted-foreground">Carregando configuração...</p>
                </div>
            </div>
        )
    }

    if (!config) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                    <p className="text-destructive">Erro ao carregar configuração</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container max-w-7xl py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Bot className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Configuração do Agente IA</h1>
                        <p className="text-muted-foreground mt-1">
                            Personalize o comportamento e personalidade do seu atendente virtual
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        <User className="w-3 h-3" />
                        Reconhecimento automático de clientes
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Atendimento personalizado
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Configuration (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Informações Básicas
                            </CardTitle>
                            <CardDescription>
                                Defina a identidade e função do seu agente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="agent-name">Nome do Agente</Label>
                                <Input
                                    id="agent-name"
                                    value={config.agent_name}
                                    onChange={(e) => setConfig({ ...config, agent_name: e.target.value })}
                                    placeholder="Ex: Atendente da Pizzaria Bella"
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Este nome será usado nas conversas com os clientes
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="agent-function">Função do Agente</Label>
                                <Textarea
                                    id="agent-function"
                                    value={config.agent_function}
                                    onChange={(e) => setConfig({ ...config, agent_function: e.target.value })}
                                    rows={4}
                                    placeholder="Descreva o que o agente deve fazer. Ex: Atender clientes, tirar dúvidas do cardápio, registrar pedidos e fornecer informações sobre horários e entregas."
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Descreva claramente o papel e responsabilidades do agente
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tone of Voice */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Tom de Voz
                            </CardTitle>
                            <CardDescription>
                                Escolha como o agente se comunica com os clientes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={config.tone_of_voice}
                                onValueChange={(value) =>
                                    setConfig({ ...config, tone_of_voice: value as ToneOfVoice })
                                }
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(['formal', 'friendly', 'casual', 'professional'] as ToneOfVoice[]).map(
                                        (tone) => (
                                            <div
                                                key={tone}
                                                className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-all ${
                                                    config.tone_of_voice === tone
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-transparent hover:border-muted'
                                                }`}
                                            >
                                                <RadioGroupItem value={tone} id={tone} className="mt-1" />
                                                <div className="flex-1">
                                                    <Label htmlFor={tone} className="font-medium capitalize cursor-pointer">
                                                        {tone === 'formal' && 'Formal'}
                                                        {tone === 'friendly' && 'Amigável'}
                                                        {tone === 'casual' && 'Descontraído'}
                                                        {tone === 'professional' && 'Profissional e Rápido'}
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {getToneDescription(tone)}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </RadioGroup>

                            <Separator />

                            <div>
                                <Label htmlFor="tone-notes">Observações de Tom (Opcional)</Label>
                                <Textarea
                                    id="tone-notes"
                                    value={config.tone_notes || ''}
                                    onChange={(e) => setConfig({ ...config, tone_notes: e.target.value })}
                                    rows={2}
                                    placeholder='Ex: "Use emojis moderadamente", "Seja direto e objetivo"'
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Instructions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary" />
                                Instruções Adicionais
                            </CardTitle>
                            <CardDescription>
                                Regras e comportamentos específicos para o agente
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="additional-instructions">Regras Personalizadas</Label>
                                <Textarea
                                    id="additional-instructions"
                                    value={config.additional_instructions || ''}
                                    onChange={(e) => setConfig({ ...config, additional_instructions: e.target.value })}
                                    rows={6}
                                    placeholder={`Exemplos:\n- Não ofereça produtos fora do cardápio\n- Sempre confirme endereço antes de finalizar pedidos de entrega\n- Sugira bebida apenas se o cliente pedir lanche\n- Use o nome do cliente sempre que possível para personalizar o atendimento\n- Consulte o histórico de pedidos para fazer sugestões relevantes`}
                                    className="mt-1 font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    💡 Dica: O agente reconhece automaticamente clientes pelo número de telefone e acessa seu histórico de pedidos para um atendimento personalizado.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card className="sticky bottom-4 shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 shadow-md"
                                    size="lg"
                                >
                                    {saveStatus === 'success' ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Salvo!
                                        </>
                                    ) : saveStatus === 'error' ? (
                                        <>
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Erro ao salvar
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            {saving ? 'Salvando...' : 'Salvar Configuração'}
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    disabled={saving}
                                    size="lg"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Resetar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Simulator (5 cols) */}
                <div className="lg:col-span-5">
                    <Card className="sticky top-8">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Bot className="w-5 h-5 text-green-600" />
                                Teste em Tempo Real
                            </CardTitle>
                            <CardDescription className="text-center">
                                Teste o agente com as configurações atuais
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {restaurantId && (
                                <div className="flex justify-center">
                                    <div className="transform scale-75 origin-top">
                                        <MobileSimulator
                                            restaurantId={restaurantId}
                                            restaurantName={restaurantName}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
