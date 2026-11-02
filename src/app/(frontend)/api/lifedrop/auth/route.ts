import { getPayload } from 'payload'
import config from '@payload-config'
import { appAuth } from '@/lib/app-auth'
import { requireJSON, safeUser, text } from '@/lib/lifedrop-http'
import { bloodGroups } from '@/lib/lifedrop-access'

export async function GET() {
  const user = await appAuth.currentUser()
  return Response.json(
    { user: user ? safeUser(user) : null },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
export async function POST(request: Request) {
  try {
    requireJSON(request)
    const body = await request.json()
    if (body.action === 'logout') {
      await appAuth.logout()
      return Response.json({ success: true })
    }
    if (!['login', 'signup'].includes(body.action)) throw new Error('Choose login or signup.')
    const email = text(body.email, 'Email', 254).toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')
    const password = text(body.password, 'Password', 128, 8)
    const role = text(body.role, 'Role')
    if (!['donor', 'receiver', 'hospital'].includes(role)) throw new Error('Select a valid role.')
    if (body.action === 'signup') {
      const name = text(body.name, 'Name')
      const city = text(body.city, 'City', 80)
      if (role === 'donor' && !bloodGroups.includes(body.bloodGroup))
        throw new Error('Select your blood group.')
      const payload = await getPayload({ config })
      await payload.create({
        collection: 'users',
        overrideAccess: false,
        data: {
          name,
          city,
          email,
          password,
          role: role as 'donor' | 'receiver' | 'hospital',
          ...(role === 'donor' ? { bloodGroup: body.bloodGroup, available: true } : {}),
        },
      })
    }
    try {
      const user = await appAuth.login(email, password, role)
      return Response.json({ success: true, user: safeUser(user) })
    } catch {
      return Response.json(
        {
          error: 'Unable to sign in. Check your credentials and selected role, or try again later.',
        },
        { status: 401 },
      )
    }
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error && !('data' in err)
            ? err.message
            : 'Unable to create this account. Check the details or try a different email.',
      },
      { status: 400 },
    )
  }
}
