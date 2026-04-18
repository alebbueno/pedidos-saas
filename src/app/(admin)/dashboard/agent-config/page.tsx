import { redirect } from 'next/navigation'

/** Agente IA temporariamente indisponível na UI — rota mantida para não quebrar links antigos. */
export default function AgentConfigPage() {
    redirect('/dashboard')
}
