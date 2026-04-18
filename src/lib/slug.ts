/** URL-safe slug from a display name or raw slug input (lowercase, hyphenated). */
export function slugifyFromName(input: string): string {
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function isValidPublicSlug(slug: string): boolean {
    const s = slug.trim().toLowerCase()
    if (s.length < 2 || s.length > 80) return false
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)
}
