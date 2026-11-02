import 'server-only'
import { cookies } from 'next/headers'
import { getPayload, JWTAuthentication } from 'payload'
import config from '@payload-config'

export function createAppAuth(appUserCollection: 'users') {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.FIGMA === '1',
    sameSite: (process.env.NODE_ENV === 'production' || process.env.FIGMA === '1'
      ? 'none'
      : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 7200,
  }
  return {
    async currentUser() {
      const token = (await cookies()).get('app-session')?.value
      if (!token) return null
      const payload = await getPayload({ config })
      try {
        const headers = new Headers({ Authorization: `JWT ${token}`, DisableAutologin: 'true' })
        const resolved = await payload.auth({ headers })
        // Make's CMS-only strategy registry omits local JWT authentication.
        // Use Payload's public native verifier, without altering CMS strategies.
        const { user } = resolved.user ? resolved : await JWTAuthentication({ headers, payload })
        return user?.collection === appUserCollection ? user : null
      } catch {
        return null
      }
    },
    async login(email: string, password: string, role: string) {
      const payload = await getPayload({ config })
      const result = await payload.login({
        collection: appUserCollection,
        data: { email, password },
      })
      if (!result.user || result.user.role !== role || !result.token)
        throw new Error('Check your email, password and selected role.')
      ;(await cookies()).set('app-session', result.token, cookieOptions)
      return result.user
    },
    async logout() {
      ;(await cookies()).set('app-session', '', { ...cookieOptions, maxAge: 0 })
    },
  }
}
export const appAuth = createAppAuth('users')
