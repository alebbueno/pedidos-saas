/**
 * Normaliza telefone/WhatsApp da loja para links (wa.me, tel:).
 * Remove não-dígitos; se for BR sem DDI (10–11 dígitos), prefixa 55.
 */
export function normalizePhoneForWhatsAppLink(input: string | null | undefined): string | null {
    if (!input?.trim()) return null
    let d = input.replace(/\D/g, '')
    if (!d) return null
    while (d.startsWith('0')) d = d.slice(1)
    if (!d) return null
    if (d.length >= 10 && d.length <= 11 && !d.startsWith('55')) {
        d = `55${d}`
    }
    return d
}

/** Exibição amigável no cardálogo (BR). Se não reconhecer, devolve o texto original. */
export function formatRestaurantPhoneDisplay(raw: string | null | undefined): string {
    if (!raw?.trim()) return ''
    const t = raw.trim()
    const d = t.replace(/\D/g, '')
    if (d.length === 11) {
        return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    }
    if (d.length === 10) {
        return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    }
    if (d.length === 13 && d.startsWith('55')) {
        const x = d.slice(2)
        return `(${x.slice(0, 2)}) ${x.slice(2, 7)}-${x.slice(7)}`
    }
    return t
}
