import type { BusinessSegment } from '@/types'

/** Opções de segmento — onboarding e configurações da loja */
export const BUSINESS_SEGMENT_OPTIONS: {
    value: BusinessSegment
    label: string
    emoji: string
    hint: string
}[] = [
    { value: 'food', label: 'Alimentação / delivery', emoji: '🍕', hint: 'Pratos, bebidas e entrega' },
    { value: 'fashion', label: 'Loja de roupas', emoji: '👕', hint: 'Variações de tamanho e cor' },
    { value: 'handcraft', label: 'Artesanato', emoji: '🎁', hint: 'Catálogo e personalização simples' },
    { value: 'retail', label: 'Varejo / outros', emoji: '🛍️', hint: 'Catálogo genérico (cosméticos, perfumaria, etc.)' },
]
