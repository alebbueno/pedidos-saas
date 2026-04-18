import type { BusinessSegment, ProductType } from '@/types'

export type OrdersBoardStyle = 'kanban' | 'list'

export interface SegmentRules {
    segment: BusinessSegment
    /** Master flag: meio a meio, taxa meio a meio no admin, fluxo pizza */
    allowHalfAndHalf: boolean
    /** If true, half UI only when product_type === 'composed' (future tightening) */
    halfAndHalfRequiresComposedType: boolean
    showDeliveryFee: boolean
    deliveryAddressRequired: boolean
    ordersBoardStyle: OrdersBoardStyle
    /** Product types offered in admin for new/edited products */
    allowedProductTypes: ProductType[]
}

const FOOD_TYPES: ProductType[] = ['simple', 'customizable', 'variant', 'composed']
const NON_FOOD_TYPES: ProductType[] = ['simple', 'customizable', 'variant']

function normalizeSegmentKey(segment: BusinessSegment | string | null | undefined): BusinessSegment {
    const raw = segment || 'food'
    if (raw === 'beauty') return 'retail'
    if (raw === 'food' || raw === 'fashion' || raw === 'handcraft' || raw === 'retail') return raw
    return 'retail'
}

export function getSegmentRules(segment: BusinessSegment | string | null | undefined): SegmentRules {
    const s = normalizeSegmentKey(segment)

    switch (s) {
        case 'food':
            return {
                segment: 'food',
                allowHalfAndHalf: true,
                halfAndHalfRequiresComposedType: false,
                showDeliveryFee: true,
                deliveryAddressRequired: true,
                ordersBoardStyle: 'kanban',
                allowedProductTypes: FOOD_TYPES,
            }
        case 'fashion':
        case 'handcraft':
        case 'retail':
            return {
                segment: s,
                allowHalfAndHalf: false,
                halfAndHalfRequiresComposedType: false,
                showDeliveryFee: true,
                deliveryAddressRequired: false,
                ordersBoardStyle: 'list',
                allowedProductTypes: NON_FOOD_TYPES,
            }
        default:
            return getSegmentRules('retail')
    }
}

/** Category + product flags + segment + optional composed-only rule */
export function canShowHalfAndHalf(
    segment: BusinessSegment | string | null | undefined,
    categoryAllows: boolean | undefined,
    productAllows: boolean | undefined,
    productType: ProductType | string | null | undefined
): boolean {
    const rules = getSegmentRules(segment)
    if (!rules.allowHalfAndHalf) return false
    if (!categoryAllows || !productAllows) return false
    if (rules.halfAndHalfRequiresComposedType) {
        return productType === 'composed'
    }
    if (productType === 'simple' || productType === 'variant') {
        return false
    }
    return true
}
