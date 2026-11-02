import { getPayload } from 'payload'
import config from '@payload-config'
import { requireJSON, text } from '@/lib/lifedrop-http'

export async function POST(request: Request) {
  try {
    requireJSON(request)
    const body = await request.json()
    const name = text(body.name, 'Name')
    const email = text(body.email, 'Email', 254)
    const message = text(body.message, 'Message', 2000, 10)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email.')
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'contact-messages',
      data: { name, email, message },
      overrideAccess: false,
    })
    return Response.json({ success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unable to send your message.' },
      { status: 400 },
    )
  }
}
