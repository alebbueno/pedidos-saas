/**
 * Rótulos em pt-BR para `orders.payment_method` (slugs do checkout / API).
 */
export function getPaymentMethodLabel(raw: string | null | undefined): string {
    if (raw == null || String(raw).trim() === '') return 'Não informado'

    const m = String(raw).toLowerCase().trim().replace(/\s+/g, '_')

    switch (m) {
        case 'pix':
            return 'PIX'
        case 'card_machine':
            return 'Cartão na maquininha'
        case 'money':
        case 'cash':
            return 'Dinheiro'
        case 'card':
        case 'credit':
        case 'debit':
            return 'Cartão'
        case 'voucher':
            return 'Vale'
        case 'online':
            return 'Pagamento online'
        default:
            return String(raw)
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())
    }
}
