'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDefaultAgentConfig } from '@/lib/agent-utils'

export type ToneOfVoice = 'formal' | 'friendly' | 'casual' | 'professional'

export interface AgentConfig {
    id?: string
    restaurant_id: string
    agent_name: string
    agent_function: string
    tone_of_voice: ToneOfVoice
    tone_notes?: string | null
    restaurant_type?: string | null
    opening_hours?: string | null
    delivery_fee?: number | null
    avg_delivery_time_minutes?: number | null
    accepts_pickup?: boolean
    additional_instructions?: string | null
    is_active?: boolean
}

/**
 * Get agent configuration for a restaurant
 */
export async function getAgentConfig(restaurantId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .single()

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error fetching agent config:', error)
        return { data: null, error: error.message }
    }

    // If no config exists, return default
    if (!data) {
        return { data: getDefaultAgentConfig(restaurantId), error: null }
    }

    return { data, error: null }
}

/**
 * Create or update agent configuration
 */
export async function upsertAgentConfig(config: AgentConfig) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ai_agent_configs')
        .upsert(
            {
                restaurant_id: config.restaurant_id,
                agent_name: config.agent_name,
                agent_function: config.agent_function,
                tone_of_voice: config.tone_of_voice,
                tone_notes: config.tone_notes,
                restaurant_type: config.restaurant_type,
                opening_hours: config.opening_hours,
                delivery_fee: config.delivery_fee,
                avg_delivery_time_minutes: config.avg_delivery_time_minutes,
                accepts_pickup: config.accepts_pickup,
                additional_instructions: config.additional_instructions,
                is_active: config.is_active ?? true,
            },
            {
                onConflict: 'restaurant_id',
            }
        )
        .select()
        .single()

    if (error) {
        console.error('Error upserting agent config:', error)
        return { data: null, error: error.message }
    }

    revalidatePath('/dashboard/agent-config')
    return { data, error: null }
}


