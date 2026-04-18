import { Plus_Jakarta_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import type { Viewport } from 'next'

export const viewport: Viewport = {
    viewportFit: 'cover',
}

const storeSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    display: 'swap',
    weight: ['400', '500', '600', '700', '800'],
})

/**
 * Tipografia e base visual só da vitrine pública (loja).
 * Evita herdar apenas Geist e dá ritmo mais “comércio local” sem quebrar o restante do app.
 */
export default function PublicStoreLayout({ children }: { children: ReactNode }) {
    return (
        <div
            className={`${storeSans.className} min-h-dvh bg-stone-50 text-stone-900 antialiased [text-rendering:optimizeLegibility]`}
        >
            {children}
        </div>
    )
}
