import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  HeartHandshake,
  ShieldCheck,
  Users,
  Building2,
  Droplet,
  Check,
  Clock3,
  MapPin,
  Camera as Instagram,
  BriefcaseBusiness as Linkedin,
  MessageCircle as Facebook,
  Mail,
  HeartPulse,
  HandHeart,
  ChevronDown,
} from 'lucide-react'
import Header from './Header'
import {
  Logo,
  primaryButton,
  secondaryButton,
  SectionHeading,
  Eyebrow,
  TextLink,
  getPhoto,
} from './ui'
import { BloodGuide, ContactForm } from './LandingInteractions'
import BloodDropLoader from './BloodDropLoader'

export const FALLBACK_VISUALS = {
  elderPortrait: {
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    alt: 'An elderly man with a hopeful smile',
  },
  adultPortrait: {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    alt: 'A smiling young Indian woman',
  },
  childPortrait: {
    url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
    alt: 'A smiling child',
  },
  aboutPhoto: {
    url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80',
    alt: 'A volunteer taking part in a blood donation drive',
  },
}

export const FALLBACK_CAMPAIGN_IMAGES = [
  'https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
]

const FALLBACK_CAMPAIGNS = [
  {
    id: 'camp-1',
    title: 'City Blood Drive at Metro Hall',
    location: 'Metro Civic Center, Mumbai',
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    time: '09:00 AM – 04:00 PM',
    label: 'Urgent Weekend Drive',
    image: { url: FALLBACK_CAMPAIGN_IMAGES[0], alt: 'Community blood drive' },
  },
  {
    id: 'camp-2',
    title: 'Hospital Voluntary Transfusion Camp',
    location: 'Lilavati Hospital & Research Centre',
    date: new Date(Date.now() + 5 * 86400000).toISOString(),
    time: '10:00 AM – 05:00 PM',
    label: 'Clinical Partner Drive',
    image: { url: FALLBACK_CAMPAIGN_IMAGES[1], alt: 'Hospital voluntary camp' },
  },
  {
    id: 'camp-3',
    title: 'University Youth Lifesaver Drive',
    location: 'St. Xavier’s College Quadrangle',
    date: new Date(Date.now() + 9 * 86400000).toISOString(),
    time: '11:00 AM – 03:30 PM',
    label: 'Youth Initiative',
    image: { url: FALLBACK_CAMPAIGN_IMAGES[2], alt: 'University youth drive' },
  },
]

const FALLBACK_HOSPITALS = [
  { id: 'hosp-1', name: 'Apollo Hospitals', shortName: 'Apollo Blood Bank', city: 'Mumbai' },
  { id: 'hosp-2', name: 'Lilavati Hospital', shortName: 'Lilavati Transfusion Wing', city: 'Mumbai' },
  { id: 'hosp-3', name: 'Fortis Healthcare', shortName: 'Fortis Blood Centre', city: 'Mumbai' },
  { id: 'hosp-4', name: 'Tata Memorial Hospital', shortName: 'Tata Memorial Blood Bank', city: 'Mumbai' },
  { id: 'hosp-5', name: 'Hinduja Hospital', shortName: 'Hinduja Clinical Bank', city: 'Mumbai' },
  { id: 'hosp-6', name: 'Kokilaben Dhirubhai Ambani Hospital', shortName: 'Kokilaben Transfusion', city: 'Mumbai' },
]

type HomeProps = {
  visuals: {
    elderPortrait?: unknown
    adultPortrait?: unknown
    childPortrait?: unknown
    aboutPhoto?: unknown
  }
  campaigns: {
    id: string | number
    title: string
    location: string
    date: string
    time: string
    label?: string | null
    image?: unknown
  }[]
  hospitals: { id: string | number; name: string; shortName?: string | null; city: string }[]
}

const steps = [
  {
    icon: HeartHandshake,
    number: '01',
    title: 'Become a donor',
    description:
      'Register, declare your blood group, and set up your availability so emergency centres can reach out.',
    link: 'Register as a donor',
  },
  {
    icon: Building2,
    number: '02',
    title: 'Connect with a hospital',
    description:
      'Qualified clinical teams assess eligibility, screen haemoglobin, and ensure every donation is safe.',
    link: 'Join as a hospital',
  },
  {
    icon: HandHeart,
    number: '03',
    title: 'Find the help you need',
    description:
      'Request blood for patients, discover verified matching donors nearby, and track fulfillment in real time.',
    link: 'Find a blood donor',
  },
]

const questions = [
  [
    'Who can donate blood?',
    'Eligibility depends on age, weight, health, medications and donation history under applicable Indian blood-centre guidelines. A qualified healthcare professional must screen you, check haemoglobin and confirm eligibility at every visit. Registering on LifeDrop does not establish medical eligibility.',
  ],
  [
    'How often can I donate blood?',
    'Donation intervals depend on the type of donation and applicable guidelines. In India, whole-blood intervals are generally at least 90 days for men and 120 days for women. Your blood centre will assess your individual circumstances and confirm when you can donate again.',
  ],
  [
    'Is donating blood safe?',
    'At a licensed blood centre, trained staff use sterile, single-use equipment. They assess your health before donation and provide aftercare. Tell staff about any medical conditions, medications, symptoms or concerns.',
  ],
  [
    'How long does a donation take?',
    'Plan for around 45–60 minutes for registration, screening, donation and refreshments. The whole-blood collection itself usually takes about 8–10 minutes; timing varies by centre.',
  ],
  [
    'Can I request blood for someone else?',
    'Yes. Create a receiver account and coordinate the request with the patient’s treating hospital. Do not share sensitive patient information in public requests. Final compatibility and clinical decisions remain with qualified healthcare staff.',
  ],
]

export default function Home({ visuals, campaigns, hospitals }: HomeProps) {
  const elder = getPhoto(visuals?.elderPortrait) || FALLBACK_VISUALS.elderPortrait
  const adult = getPhoto(visuals?.adultPortrait) || FALLBACK_VISUALS.adultPortrait
  const child = getPhoto(visuals?.childPortrait) || FALLBACK_VISUALS.childPortrait

  const portraits = [elder, adult, child]
  const about = getPhoto(visuals?.aboutPhoto) || FALLBACK_VISUALS.aboutPhoto

  const activeCampaigns = campaigns && campaigns.length > 0 ? campaigns : FALLBACK_CAMPAIGNS
  const activeHospitals = hospitals && hospitals.length > 0 ? hospitals : FALLBACK_HOSPITALS

  return (
    <>
      <BloodDropLoader minDisplayTime={720} />
      <Header />
      <main>
        {/* HERO SECTION */}
        <section className="relative isolate overflow-hidden bg-white">
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[48%] bg-[#1e0708] md:block" />
          <div className="relative mx-auto grid min-h-[640px] max-w-[1440px] md:grid-cols-[52%_48%]">
            <div className="relative z-10 flex flex-col justify-center px-6 pb-16 pt-14 md:py-16 md:pl-12 lg:pl-[max(40px,calc((100vw-1200px)/2))] xl:pr-12">
              <div className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#FFF1F1] text-[#D92027]">
                  <Heart size={12} fill="currentColor" />
                </span>
                A little of you. A lifetime for someone.
              </div>

              <h1 className="max-w-xl text-[54px] leading-[1.04] font-extrabold tracking-[-0.04em] text-[#111827] sm:text-[68px] lg:text-[78px]">
                Give Blood,
                <br />
                <span className="text-brand">Save Lives.</span>
              </h1>

              <p className="mt-5 max-w-[460px] text-descriptive text-descriptive-lg">
                Your one drop of blood can change someone&apos;s entire world. Connect with verified
                donors, hospitals, and a community built to safeguard lives.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/join" className={`${primaryButton} !px-6 !py-3.5`}>
                  <Droplet size={16} fill="currentColor" />
                  <span>Donate Now</span>
                  <ArrowRight size={15} />
                </Link>
                <Link href="#about" className={secondaryButton}>
                  <span>Learn More</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              {/* Jitter-free Tabular Statistics */}
              <div className="mt-11 flex max-w-[440px] items-center gap-6 border-t border-zinc-100 pt-7 sm:gap-9">
                {[
                  ['12K+', 'Registered Donors'],
                  ['85+', 'Partner Hospitals'],
                  ['36K+', 'Lives Impacted'],
                ].map(([n, l], i) => (
                  <div key={l} className={i ? 'border-l border-zinc-200/80 pl-6 sm:pl-9' : ''}>
                    <p className="tabular-nums text-[26px] font-extrabold tracking-tight text-[#111827]">
                      {n}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">{l}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-zinc-400">
                Illustrative community impact · clinical prototype platform
              </p>
            </div>

            {/* Editorial Portrait Collage */}
            <div
              className="hero-art relative min-h-[460px] overflow-hidden bg-[#1e0708] md:min-h-full"
              aria-label="Three generations, one shared hope"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,#8c1c20_0%,#2c0709_65%,#120405_100%)]" />
              {portraits.map(
                (photo, i) =>
                  photo?.url && (
                    <div key={i} className={`portrait portrait-${i}`}>
                      <Image
                        src={photo.url}
                        alt={
                          photo.alt ||
                          [
                            'An elderly man with a hopeful smile',
                            'A smiling young Indian woman',
                            'A smiling child',
                          ][i]
                        }
                        fill
                        sizes="(max-width: 768px) 50vw, 28vw"
                        priority
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ),
              )}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#1c0506_0%,transparent_45%),linear-gradient(90deg,#420708_0%,transparent_45%)] mix-blend-multiply" />
              <div className="pointer-events-none absolute inset-0 bg-red-700/20 mix-blend-color" />
              <div className="hero-fade pointer-events-none absolute -left-px top-0 h-full w-28 bg-gradient-to-r from-white to-transparent max-md:hidden" />
              <div className="absolute bottom-12 left-10 right-8 text-white md:left-16">
                <div className="mb-4 h-0.5 w-8 bg-red-400/80" />
                <p className="text-[22px] leading-snug font-semibold tracking-tight">
                  Different generations.
                  <br />
                  One reason to give.
                </p>
                <p className="mt-2 text-xs text-red-100/70">
                  Because every life deserves a tomorrow.
                </p>
              </div>
              <div className="absolute right-7 top-7 flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] tracking-wide text-white/90 backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-red-400" /> CONNECTED BY KINDNESS
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BANNER */}
        <div className="border-y border-black/[0.04] bg-[#F8F8FA]">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 px-6 py-4 sm:grid-cols-3">
            {[
              [ShieldCheck, 'Safe, verified & hospital-coordinated'],
              [Heart, 'One donation can save up to three lives'],
              [Users, 'A compassionate, responsive donor network'],
            ].map(([Icon, text]) => {
              const I = Icon as typeof Heart
              return (
                <div
                  className="flex items-center justify-center gap-2 text-xs font-medium text-zinc-600"
                  key={String(text)}
                >
                  <I size={16} className="text-brand shrink-0" strokeWidth={2} />
                  <span>{String(text)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="mx-auto max-w-[1240px] scroll-mt-12 px-6 py-20 lg:px-10"
        >
          <SectionHeading
            center
            eyebrow="Small steps. Life-changing impact."
            title="A simple connection. An extraordinary difference."
            description="Bringing donors, hospitals, and those in need together. Because saving lives should never be complicated."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, ...step }) => (
              <article
                key={step.number}
                className="apple-card group relative rounded-2xl p-7 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1"
              >
                <span className="tabular-nums absolute right-6 top-6 text-3xl font-extrabold tracking-tighter text-zinc-200/80">
                  {step.number}
                </span>
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#FFF1F1] text-[#D92027] ring-1 ring-[#D92027]/15">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-[#111827]">{step.title}</h3>
                <p className="mb-6 mt-2.5 text-descriptive-xs">
                  {step.description}
                </p>
                <TextLink href="/join">{step.link}</TextLink>
              </article>
            ))}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="scroll-mt-12 border-t border-black/[0.04] bg-[#F8F8FA] py-20">
          <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-6 md:grid-cols-2 lg:gap-20 lg:px-10">
            <div className="relative mb-6">
              <div className="relative aspect-[1.1] overflow-hidden rounded-3xl border border-black/[0.06] bg-[#FFF1F1] shadow-sm">
                {about?.url ? (
                  <Image
                    src={about.url}
                    alt={about.alt || 'A volunteer taking part in a blood donation drive'}
                    fill
                    sizes="(max-width: 768px) 90vw, 40vw"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <HeartHandshake size={96} className="text-brand/30" strokeWidth={1.2} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/[0.03]" />
              </div>
              <div className="apple-glass-card absolute -bottom-6 right-5 flex items-center gap-4 rounded-2xl bg-white/95 p-5 shadow-lg shadow-black/[0.06] backdrop-blur-xl">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF1F1] text-[#D92027] ring-1 ring-[#D92027]/15">
                  <Heart fill="currentColor" size={20} />
                </span>
                <div>
                  <p className="text-base font-bold text-[#111827]">Humanity in every drop.</p>
                  <p className="text-xs font-normal text-slate-500">More than a platform. A promise.</p>
                </div>
              </div>
            </div>

            <div>
              <SectionHeading
                eyebrow="About LifeDrop"
                title="We believe no one should have to wait for hope."
                description="Behind every blood request is a person, a family, and a future. We bring caring donors and hospital teams together at the moments that matter most."
              />
              <div className="mt-8 space-y-4">
                {[
                  [
                    'Our mission',
                    'Make safe blood donation more accessible by connecting willing donors with trusted hospitals and people in need.',
                  ],
                  [
                    'Our vision',
                    'A world where timely blood availability is a certainty, not a gamble.',
                  ],
                ].map(([t, d]) => (
                  <div key={t} className="flex gap-3.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FFF1F1] text-[#D92027]">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">{t}</h3>
                      <p className="mt-1 text-descriptive-xs">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link className={primaryButton} href="/join">
                  <span>Be part of the change</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* BLOOD GROUPS SECTION */}
        <section
          id="blood-groups"
          className="mx-auto max-w-[1240px] scroll-mt-12 px-6 py-20 lg:px-10"
        >
          <SectionHeading
            center
            eyebrow="Different types. The same gift of life."
            title="Your blood group. Someone’s lifeline."
            description="Every blood group is critical. Understand your compatibility profile and see how your donation makes a tangible difference."
          />
          <BloodGuide />
        </section>

        {/* WHY GIVE BLOOD */}
        <section className="border-t border-black/[0.04] bg-[#F8F8FA] py-20">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                eyebrow="Why give blood?"
                title="A small act for you. A second chance for someone."
              />
              <p className="max-w-[340px] text-xs font-normal leading-relaxed text-slate-500">
                There is no artificial substitute for human blood. Just compassionate people choosing
                to show up.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: HeartPulse,
                  title: 'Be someone’s second chance',
                  text: 'Your donation supports emergency surgery, trauma cases, and patients undergoing chemotherapy or treating blood disorders.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Know more about your health',
                  text: 'Every donation starts with thorough vitals and haemoglobin screening by certified clinical staff.',
                },
                {
                  icon: HeartHandshake,
                  title: 'Strengthen local health readiness',
                  text: 'Join a proactive donor community that enables local hospitals to respond instantly to critical shortages.',
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="apple-card flex gap-4 rounded-2xl p-6 transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1F1] text-[#D92027] ring-1 ring-[#D92027]/15">
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">{title}</h3>
                    <p className="mt-1.5 text-xs font-normal leading-relaxed text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CAMPAIGNS */}
        <section
          id="campaigns"
          className="mx-auto max-w-[1240px] scroll-mt-12 px-6 py-20 lg:px-10"
        >
          <div className="flex flex-wrap items-end justify-between gap-5">
            <SectionHeading
              eyebrow="Show up. Give hope."
              title="Good things happen when we come together."
              description="Find an authorized donation drive near you. An hour of your day can give someone years of life."
            />
            <TextLink href="/join">Join a campaign</TextLink>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {activeCampaigns.map((campaign, idx) => {
              const photo = getPhoto(campaign.image) || {
                url: FALLBACK_CAMPAIGN_IMAGES[idx % FALLBACK_CAMPAIGN_IMAGES.length],
                alt: campaign.title,
              }
              const date = new Date(campaign.date)
              return (
                <article
                  key={campaign.id}
                  className="apple-card group overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-200 hover:-translate-y-1"
                >
                  <div className="relative aspect-[1.65] overflow-hidden bg-[#FFF1F1]">
                    {photo?.url ? (
                      <Image
                        src={photo.url}
                        alt={photo.alt || campaign.title}
                        fill
                        sizes="(max-width: 768px) 90vw, 30vw"
                        unoptimized
                        className="object-cover transition duration-500 ease-[var(--ease-out)] group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Droplet size={64} className="text-brand/30" />
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-brand shadow-sm backdrop-blur">
                      {campaign.label || 'Community drive'}
                    </span>
                    <span className="absolute bottom-4 right-4 rounded-xl bg-white px-3 py-2 text-center text-brand shadow-md">
                      <b className="tabular-nums block text-xl font-black leading-none">
                        {date.getUTCDate()}
                      </b>
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {date.toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' })}
                      </span>
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#111827]">{campaign.title}</h3>
                    <p className="mt-2.5 flex items-center gap-1.5 text-xs font-normal text-slate-500">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span>{campaign.location}</span>
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-normal text-slate-500">
                      <Clock3 size={13} className="text-slate-400 shrink-0" />
                      <span>{campaign.time}</span>
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3.5">
                      <Link href="/join" className="text-xs font-semibold tracking-tight text-brand">
                        Register your interest
                      </Link>
                      <ArrowUpRight className="text-brand" size={15} />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {!campaigns.length && (
            <p className="mt-8 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-xs font-normal text-slate-500">
              New donation campaigns will be scheduled here. Join our community to receive updates.
            </p>
          )}
        </section>

        {/* PARTNER HOSPITALS */}
        <section id="hospitals" className="border-y border-black/[0.04] bg-[#F8F8FA] py-14">
          <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
            <div className="text-center">
              <Eyebrow>Healthcare Partners</Eyebrow>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
                Trusted hospitals. A shared commitment.
              </h2>
              <p className="mt-2 text-xs font-normal text-slate-500">
                Partner medical centres coordinating safe screenings and clinical transfusions.
              </p>
            </div>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              {activeHospitals.map((h) => (
                <div
                  key={h.id}
                  className="apple-card flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-xs"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF1F1] text-[#D92027]">
                    <Building2 size={18} strokeWidth={2} />
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#111827]">{h.shortName || h.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                      {h.city} · Hospital Network
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION WITH POLISHED DISCLOSURES */}
        <section
          id="faq"
          className="mx-auto grid max-w-[1240px] scroll-mt-12 gap-10 px-6 py-20 md:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10"
        >
          <div>
            <SectionHeading
              eyebrow="A little clarity goes a long way."
              title="Frequently Asked Questions"
              description="It’s natural to have questions before donating. Here are direct answers to help you prepare."
            />
            <div className="mt-7">
              <TextLink href="#contact">Ask our clinical team</TextLink>
            </div>
          </div>

          <div className="divide-y divide-zinc-200/70">
            {questions.map(([q, a], i) => (
              <details key={q} className="group py-4.5" open={i === 0}>
                <summary className="tactile-btn flex cursor-pointer list-none items-center justify-between gap-6 text-sm font-semibold tracking-tight text-[#111827] select-none">
                  <span>{q}</span>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FFF1F1] text-[#D92027] transition-transform duration-200 ease-[var(--ease-out)] group-open:rotate-180">
                    <ChevronDown size={14} strokeWidth={2.5} />
                  </span>
                </summary>
                <p className="max-w-[65ch] pr-8 pt-3 text-descriptive-xs">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="mx-auto max-w-[1240px] px-6 pb-20 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl bg-brand px-7 py-14 text-center text-white md:px-14">
            <Droplet
              className="pointer-events-none absolute -right-12 -top-12 size-80 rotate-12 text-white/5"
              fill="currentColor"
            />
            <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Heart size={20} fill="currentColor" />
            </span>
            <h2 className="relative text-3xl font-extrabold tracking-tight md:text-4xl">
              Someone’s tomorrow starts with you.
            </h2>
            <p className="relative mx-auto mt-3.5 max-w-lg text-[18px] md:text-[19px] font-normal leading-[1.5] text-red-100/90 tracking-normal">
              You don’t need special qualifications to make an extraordinary difference.
              <br className="hidden sm:inline" />
              Just an hour of your time, empathy, and the willingness to give.
            </p>
            <div className="relative mt-7">
              <Link
                href="/join"
                className="tactile-btn inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand shadow-lg shadow-black/10 transition-[transform,background-color] duration-150 ease-[var(--ease-out)] hover:bg-zinc-50 active:scale-[0.97]"
              >
                <span>Become a Donor</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="scroll-mt-12 border-t border-black/[0.04] bg-[#F8F8FA] py-16">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-6 md:grid-cols-2 lg:gap-24 lg:px-10">
            <div>
              <SectionHeading
                eyebrow="Let’s stay connected"
                title="Every conversation counts."
                description="Have a question, want to partner with us, or bring a donation drive to your community? Our coordination team is here."
              />
              <div className="mt-6 flex items-center gap-3 text-xs font-semibold text-zinc-700">
                <span className="flex size-8 items-center justify-center rounded-xl bg-[#FFF1F1] text-[#D92027]">
                  <Mail size={15} />
                </span>
                <span>support@lifedrop.example</span>
              </div>
              <p className="mt-5 max-w-sm text-[11px] leading-relaxed text-zinc-400">
                LifeDrop is a non-emergency coordination network. For urgent clinical care, please
                reach out directly to your treating facility or dial 112.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-[#171717] text-white">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-10">
          <div>
            <Logo light />
            <p className="mt-4 max-w-[240px] text-xs leading-relaxed text-zinc-400">
              Connecting hearts. Sharing hope.
              <br />
              Saving lives, one drop at a time.
            </p>
            <div className="mt-5 flex gap-2.5">
              {[
                [Instagram, 'https://www.instagram.com/'],
                [Facebook, 'https://www.facebook.com/'],
                [Linkedin, 'https://www.linkedin.com/'],
              ].map(([Icon, href]) => {
                const I = Icon as typeof Instagram
                return (
                  <a
                    key={String(href)}
                    href={String(href)}
                    aria-label={`Visit ${String(href).split('.')[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tactile-btn flex size-8 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition-colors duration-150 hover:border-white/30 hover:text-white"
                  >
                    <I size={13} />
                  </a>
                )
              })}
            </div>
          </div>
          {[
            [
              'Explore',
              ['About LifeDrop', '#about'],
              ['How it works', '#how-it-works'],
              ['Our campaigns', '#campaigns'],
              ['Partner hospitals', '#hospitals'],
            ],
            [
              'Get involved',
              ['Become a donor', '/join'],
              ['Find blood donors', '/join'],
              ['Partner with us', '#contact'],
              ['Host a blood drive', '#contact'],
            ],
            [
              'Need a hand?',
              ['FAQs', '#faq'],
              ['Contact us', '#contact'],
              ['Blood group guide', '#blood-groups'],
              ['Donor eligibility', '#faq'],
            ],
          ].map(([title, ...items]) => (
            <div key={String(title)}>
              <h3 className="mb-4 text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                {String(title)}
              </h3>
              <div className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <Link
                    key={item[0]}
                    href={item[1]}
                    className="tactile-btn text-xs text-zinc-400 transition-colors duration-150 hover:text-white"
                  >
                    {item[0]}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-6 py-4 text-[11px] text-zinc-500 lg:px-10">
            <p>© {new Date().getFullYear()} LifeDrop. Clinical Demonstration Platform.</p>
            <p className="flex items-center gap-1.5">
              <span>Made with care</span>
              <Heart size={11} className="text-brand fill-brand" />
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
