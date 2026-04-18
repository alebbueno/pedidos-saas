import type { Restaurant } from '@/types'

/** JSONB às vezes chega como string; normaliza para objeto. */
export function normalizeOpeningHours(
    raw: Restaurant['opening_hours'] | string | null | undefined
): Restaurant['opening_hours'] | null {
    if (raw == null) return null
    if (typeof raw === 'string') {
        const t = raw.trim()
        if (!t) return null
        try {
            const parsed = JSON.parse(t) as unknown
            if (parsed && typeof parsed === 'object') {
                return parsed as Restaurant['opening_hours']
            }
            return null
        } catch {
            return null
        }
    }
    if (typeof raw === 'object') {
        return raw as Restaurant['opening_hours']
    }
    return null
}

const DAY_KEYS = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
] as const

type DayKey = (typeof DAY_KEYS)[number]

type DaySchedule = { open: string; close: string; enabled: boolean }

function asSchedule(h: Restaurant['opening_hours'], key: string): DaySchedule | undefined {
    const v = h?.[key]
    if (!v || typeof v !== 'object') return undefined
    return v as DaySchedule
}

function hasConfiguredOpeningHours(hours: Restaurant['opening_hours'] | null | undefined): boolean {
    const h = normalizeOpeningHours(hours)
    if (!h) return false
    return Object.keys(h).some((k) => {
        const s = asSchedule(h, k)
        return Boolean(s?.enabled)
    })
}

function parseTimeToMinutes(time: string): number | null {
    const parts = time?.split(':')
    if (!parts || parts.length < 2) return null
    const h = Number.parseInt(parts[0], 10)
    const m = Number.parseInt(parts[1], 10)
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null
    return h * 60 + m
}

function isOvernight(openM: number, closeM: number): boolean {
    return closeM <= openM
}

function minutesFromMidnight(d: Date): number {
    return d.getHours() * 60 + d.getMinutes()
}

function dayKeyFromDate(d: Date): DayKey {
    return DAY_KEYS[d.getDay()]
}

/**
 * Loja aceita pedido agora, com base em `opening_hours` (fuso do dispositivo / servidor conforme `now`).
 * Sem horários configurados ou nenhum dia habilitado → sempre aceita (compatível com lojas antigas).
 */
export function isRestaurantOpenAt(
    openingHours: Restaurant['opening_hours'] | string | null | undefined,
    now: Date = new Date()
): boolean {
    const hours = normalizeOpeningHours(openingHours)
    if (!hasConfiguredOpeningHours(hours)) return true

    const hoursObj = hours!
    const cur = minutesFromMidnight(now)
    const todayKey = dayKeyFromDate(now)
    const yesterdayKey = DAY_KEYS[(now.getDay() + 6) % 7]

    // Virada: horário "de ontem" que atravessa meia-noite (ex.: 22h–2h)
    const yest = asSchedule(hoursObj, yesterdayKey)
    if (yest?.enabled) {
        const om = parseTimeToMinutes(yest.open)
        const cm = parseTimeToMinutes(yest.close)
        if (om !== null && cm !== null && isOvernight(om, cm) && cur < cm) {
            return true
        }
    }

    const today = asSchedule(hoursObj, todayKey)
    if (!today?.enabled) return false

    const openM = parseTimeToMinutes(today.open)
    const closeM = parseTimeToMinutes(today.close)
    if (openM === null || closeM === null) return false

    if (!isOvernight(openM, closeM)) {
        return cur >= openM && cur < closeM
    }
    return cur >= openM || cur < closeM
}

function formatHourMinuteBr(d: Date): string {
    const h = d.getHours()
    const m = d.getMinutes()
    if (m === 0) return `${h}h`
    return `${h}h${String(m).padStart(2, '0')}`
}

function sameCalendarDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

function formatRelativeOpening(next: Date, now: Date): string {
    const timeStr = formatHourMinuteBr(next)
    if (sameCalendarDay(next, now)) {
        return `hoje às ${timeStr}`
    }
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
    if (sameCalendarDay(next, tomorrow)) {
        return `amanhã às ${timeStr}`
    }
    const weekdays = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado',
    ]
    return `na ${weekdays[next.getDay()]} às ${timeStr}`
}

function findNextOpeningDateTime(
    openingHours: NonNullable<ReturnType<typeof normalizeOpeningHours>>,
    now: Date
): Date | null {
    const nowMs = now.getTime()
    let best: Date | null = null

    for (let d = 0; d <= 7; d++) {
        const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 0, 0, 0, 0)
        const sch = asSchedule(openingHours, dayKeyFromDate(base))
        if (!sch?.enabled) continue
        const openM = parseTimeToMinutes(sch.open)
        if (openM === null) continue
        const openAt = new Date(
            base.getFullYear(),
            base.getMonth(),
            base.getDate(),
            Math.floor(openM / 60),
            openM % 60,
            0,
            0
        )
        if (openAt.getTime() <= nowMs) continue
        if (!best || openAt.getTime() < best.getTime()) {
            best = openAt
        }
    }
    return best
}

export type RestaurantOrderingStatus =
    | { acceptingOrders: true }
    | { acceptingOrders: false; headline: string; detail: string }

/**
 * `isOpenManual`: coluna `restaurants.is_open` — quando `false`, a loja pausa pedidos
 * independentemente do horário (override manual no painel).
 */
export function getRestaurantOrderingStatus(
    openingHours: Restaurant['opening_hours'] | string | null | undefined,
    now: Date = new Date(),
    isOpenManual?: boolean | null
): RestaurantOrderingStatus {
    if (isOpenManual === false) {
        return {
            acceptingOrders: false,
            headline: 'Vendas pausadas',
            detail: 'No momento não estamos aceitando novos pedidos. Volte em breve ou fale com o vendedor.',
        }
    }

    const hours = normalizeOpeningHours(openingHours)
    if (!hasConfiguredOpeningHours(hours)) {
        return { acceptingOrders: true }
    }
    if (isRestaurantOpenAt(hours, now)) {
        return { acceptingOrders: true }
    }

    const next = findNextOpeningDateTime(hours!, now)
    const headline = 'Fora do horário de atendimento'
    const detail = next
        ? `No momento não é possível finalizar pedidos. Voltamos ${formatRelativeOpening(next, now)}.`
        : 'No momento não é possível finalizar pedidos. Confira os horários com o vendedor.'

    return { acceptingOrders: false, headline, detail }
}
