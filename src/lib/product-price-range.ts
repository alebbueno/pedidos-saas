/**
 * Faixa de preço do produto (base + grupos de opções), espelhando a lógica de
 * `calculatePriceForSelections` em product-options-form / product-modal.
 */

export type ProductPriceRange = {
    min: number
    max: number
}

type OptionGroupLike = {
    type?: 'single' | 'multiple'
    min_selection?: number
    max_selection?: number
    price_rule?: 'sum' | 'highest' | 'average' | null
    product_options?: { price_modifier?: number; is_available?: boolean }[]
    options?: { price_modifier?: number; is_available?: boolean }[]
}

function getModifiers(group: OptionGroupLike): number[] {
    const raw = group.product_options ?? group.options ?? []
    return raw
        .filter((o) => o?.is_available !== false)
        .map((o) => Number(o.price_modifier))
        .filter((n) => Number.isFinite(n))
}

function sumSmallest(values: number[], count: number): number {
    if (count <= 0 || values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const take = Math.min(count, sorted.length)
    return sorted.slice(0, take).reduce((s, x) => s + x, 0)
}

function sumLargest(values: number[], count: number): number {
    if (count <= 0 || values.length === 0) return 0
    const sorted = [...values].sort((a, b) => b - a)
    const take = Math.min(count, sorted.length)
    return sorted.slice(0, take).reduce((s, x) => s + x, 0)
}

function groupContributionRange(group: OptionGroupLike): { min: number; max: number } {
    const mods = getModifiers(group)
    if (mods.length === 0) return { min: 0, max: 0 }

    const minSel = Math.max(0, Math.floor(Number(group.min_selection) || 0))
    let maxSel = Math.floor(Number(group.max_selection) || 0)
    const type = group.type === 'multiple' ? 'multiple' : 'single'
    const rule = (group.price_rule || 'sum') as 'sum' | 'highest' | 'average'

    if (!maxSel || maxSel < minSel) {
        maxSel = type === 'single' ? 1 : mods.length
    }
    maxSel = Math.min(maxSel, mods.length)

    if (type === 'single') {
        if (minSel === 0) {
            return { min: 0, max: Math.max(...mods) }
        }
        return { min: Math.min(...mods), max: Math.max(...mods) }
    }

    const kMin = Math.min(minSel, mods.length)
    const kMax = Math.min(Math.max(maxSel, kMin), mods.length)

    if (rule === 'sum') {
        const minC = kMin === 0 ? 0 : sumSmallest(mods, kMin)
        const maxC = sumLargest(mods, kMax)
        return { min: minC, max: maxC }
    }

    if (rule === 'highest') {
        if (kMin === 0) {
            return { min: 0, max: Math.max(...mods) }
        }
        const sorted = [...mods].sort((a, b) => a - b)
        const minC = sorted[Math.min(kMin, sorted.length) - 1]
        const maxC = Math.max(...mods)
        return { min: minC, max: maxC }
    }

    let minC = Infinity
    let maxC = -Infinity
    for (let k = 0; k <= kMax; k++) {
        if (k < kMin) continue
        if (k === 0) {
            minC = Math.min(minC, 0)
            maxC = Math.max(maxC, 0)
            continue
        }
        minC = Math.min(minC, sumSmallest(mods, k) / k)
        maxC = Math.max(maxC, sumLargest(mods, k) / k)
    }
    return {
        min: minC === Infinity ? 0 : minC,
        max: maxC === -Infinity ? 0 : maxC,
    }
}

export function getProductPriceRange(product: {
    base_price?: number | string
    product_option_groups?: OptionGroupLike[] | null
}): ProductPriceRange {
    const base = Number(product.base_price) || 0
    const groups = product.product_option_groups ?? []

    let minT = base
    let maxT = base
    for (const g of groups) {
        const { min, max } = groupContributionRange(g)
        minT += min
        maxT += max
    }
    return { min: minT, max: maxT }
}

export function priceRangeHasSpread(range: ProductPriceRange, epsilon = 0.009): boolean {
    return range.max - range.min > epsilon
}

export function formatProductPriceDisplay(range: ProductPriceRange): string {
    if (range.min <= 0 && range.max <= 0) return 'Consultar'
    if (!priceRangeHasSpread(range)) {
        return `R$ ${range.min.toFixed(2)}`
    }
    return `R$ ${range.min.toFixed(2)} a R$ ${range.max.toFixed(2)}`
}
