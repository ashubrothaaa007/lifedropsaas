import path from 'path'
import { buildFigmaConfig } from '@payloadcms/figma'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Hospitals } from './collections/Hospitals'
import { Campaigns } from './collections/Campaigns'
import { BloodRequests } from './collections/BloodRequests'
import { DonorResponses } from './collections/DonorResponses'
import { Inventory } from './collections/Inventory'
import { Appointments } from './collections/Appointments'
import { ContactMessages } from './collections/ContactMessages'
import { DonorScreenings } from './collections/DonorScreenings'
import { LifeDropVisuals } from './globals/LifeDropVisuals'
import { DonationPolicy } from './globals/DonationPolicy'
import { DonationReservations } from './collections/DonationReservations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const baseConfig = {
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'collections', width: 'full' },
      ] as any,
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en' as const,
    supportedLanguages: { en: adminLanguage },
  },
  collections: [
    Admins,
    Media,
    Folders,
    Tags,
    Users,
    Hospitals,
    Campaigns,
    BloodRequests,
    DonorResponses,
    Inventory,
    Appointments,
    ContactMessages,
    DonorScreenings,
    DonationReservations,
  ],
  globals: [LifeDropVisuals, DonationPolicy],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [mcpPlugin({})],
  figma: {},
}

// In the Figma Make cloud environment, use Figma-managed platform configuration.
// When running locally outside Figma Make, use a local SQLite database and secret.
const isFigmaCloud = Boolean(
  process.env.FIGMA_EID || process.env.FIGMA || process.env.FIGMA_CONTENT_API_CONTENT_SYSTEM_ID,
)

export default isFigmaCloud
  ? buildFigmaConfig(baseConfig)
  : buildConfig({
      ...baseConfig,
      editor: lexicalEditor(),
      secret: process.env.PAYLOAD_SECRET || 'lifedrop-local-dev-secret-key-min-32-chars-long',
      db: sqliteAdapter({
        client: {
          url: `file:${path.resolve(dirname, 'payload.db')}`,
        },
        push: true,
      }),
    })
