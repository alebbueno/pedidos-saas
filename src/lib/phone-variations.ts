/** Variações comuns de telefone BR para busca (com/sem DDI 55). */
export function buildPhoneSearchVariations(phone: string): string[] {
    const normalized = phone.replace(/\D/g, '')
    if (!normalized) return []
    const set = new Set<string>([normalized])
    set.add(normalized.startsWith('55') ? normalized : `55${normalized}`)
    set.add(normalized.startsWith('55') ? normalized.slice(2) : normalized)
    return [...set]
}
