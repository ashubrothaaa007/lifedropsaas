export function requireJSON(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new Error('A JSON request is required.')
  const origin = request.headers.get('origin')
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  if (
    origin &&
    new URL(origin).host !== host &&
    (!configured || new URL(origin).origin !== new URL(configured).origin)
  )
    throw new Error('This request origin is not allowed.')
}
export function text(value: unknown, label: string, max = 100, min = 1) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
    throw new Error(`${label} must contain ${min}–${max} characters.`)
  return value.trim()
}
export function wholeNumber(value: unknown, max = 10000) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n) || n < 0 || n > max)
    throw new Error(`Enter a whole number between 0 and ${max}.`)
  return n
}
export function safeUser(user: {
  id: string | number
  name?: string | null
  role?: string | null
  city?: string | null
  bloodGroup?: string | null
  available?: boolean | null
  hospitalVerified?: boolean | null
  email?: string | null
}) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    city: user.city,
    bloodGroup: user.bloodGroup,
    available: user.available,
    hospitalVerified: user.hospitalVerified,
    email: user.email,
  }
}
