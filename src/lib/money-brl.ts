/**
 * Converte string no formato monetário brasileiro (milhar `.`, decimal `,`) em número.
 * Ex.: "1.234,56" → 1234.56, "35,00" → 35, "35" → 35
 */
export function parseBrlMoneyToNumber(value: string): number {
    const s = value.trim()
    if (!s) return Number.NaN
    const normalized = s.replace(/\./g, '').replace(',', '.')
    const n = Number.parseFloat(normalized)
    return Number.isFinite(n) ? n : Number.NaN
}

export function isPositiveBrlMoney(value: string): boolean {
    const n = parseBrlMoneyToNumber(value)
    return Number.isFinite(n) && n > 0
}
