import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { Home } from '@/features/home'

const getHome = unstable_cache(
  async () => {
    try {
      const payload = await getPayload({ config })
      const [visuals, campaigns, hospitals] = await Promise.all([
        payload
          .findGlobal({ slug: 'lifedrop-visuals', depth: 1, overrideAccess: false })
          .catch(() => ({})),
        payload
          .find({
            collection: 'campaigns',
            sort: 'date',
            limit: 3,
            depth: 1,
            overrideAccess: false,
          })
          .catch(() => ({ docs: [] })),
        payload
          .find({ collection: 'hospitals', limit: 6, overrideAccess: false, depth: 0 })
          .catch(() => ({ docs: [] })),
      ])
      return {
        visuals: visuals || {},
        campaigns: (campaigns as { docs?: unknown[] })?.docs || [],
        hospitals: (hospitals as { docs?: unknown[] })?.docs || [],
      }
    } catch {
      return { visuals: {}, campaigns: [], hospitals: [] }
    }
  },
  ['lifedrop-home'],
  { tags: ['lifedrop-home'] },
)

export const metadata = {
  title: 'LifeDrop — Give Blood, Save Lives.',
  description:
    'A little of you. A lifetime for someone. Connect with donors, hospitals and a community that cares.',
}

export default async function HomePage() {
  const data = await getHome()
  return <Home {...(data as any)} />
}
