import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { marketingApi } from '../lib/api'
import { useTypewriter } from '../hooks/useTypewriter'
import {
  cursorBlinkClassName,
  fadeUp,
  fadeUpLg,
  scaleIn,
  transitions,
} from '../utils/motion'

const fullText = 'Transform Your Space\nWith Fria'

function AdminBanners() {
  const { data: banners } = useQuery({
    queryKey: ['active-banners'],
    queryFn: () => marketingApi.getActiveBanners().then((res) => res.data),
  })

  if (!banners?.length) return null

  return (
    <section className="section-inner pt-4 pb-2">
      <div className="space-y-3">
        {banners.map((banner: any, index: number) => {
          const card = (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.base, delay: index * 0.08 }}
              className="group relative w-full overflow-hidden rounded-card border border-secondary-200 bg-white shadow-card-default transition-shadow duration-brand hover:shadow-card-hover"
            >
              <div className="relative aspect-[21/6] sm:aspect-[21/5] max-h-40 w-full bg-secondary-100">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || 'Promotional banner'}
                    className="h-full w-full object-cover transition-transform duration-brand group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-primary-100 via-secondary-100 to-accent-100" />
                )}

                {(banner.title || banner.description) && (
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-neutral-900/55 via-neutral-900/15 to-transparent p-4 sm:p-5">
                    {banner.title && (
                      <h3 className="text-body-sm sm:text-base font-semibold text-white line-clamp-1">
                        {banner.title}
                      </h3>
                    )}
                    {banner.description && (
                      <p className="mt-0.5 text-caption text-white/85 line-clamp-2 sm:line-clamp-1">
                        {banner.description}
                      </p>
                    )}
                    {banner.linkText && banner.linkUrl && (
                      <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-pill bg-white/90 px-3 py-1 text-caption font-semibold text-primary-700 transition-colors group-hover:bg-white">
                        {banner.linkText}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )

          return banner.linkUrl ? (
            <Link key={banner.id} to={banner.linkUrl} className="block">
              {card}
            </Link>
          ) : (
            card
          )
        })}
      </div>
    </section>
  )
}

function TypewriterHeadline() {
  const typedText = useTypewriter(fullText, 80)

  const cursor = (
    <span className={`ml-1 h-8 md:h-12 ${cursorBlinkClassName}`} aria-hidden />
  )

  if (!typedText.includes('\n')) {
    return (
      <>
        <span className="text-neutral-900">{typedText}</span>
        {cursor}
      </>
    )
  }

  const [firstLine, secondLine = ''] = typedText.split('\n')

  if (secondLine.startsWith('With ')) {
    const afterWith = secondLine.substring(5)
    const friaTyped = afterWith.substring(0, Math.min(afterWith.length, 4))
    const afterFria = afterWith.substring(4)

    return (
      <>
        <span className="text-neutral-900">{firstLine}</span>
        <br />
        <span className="text-neutral-900">With </span>
        <span className="text-primary-600">{friaTyped}</span>
        {afterFria && <span className="text-neutral-900">{afterFria}</span>}
        {cursor}
      </>
    )
  }

  return (
    <>
      <span className="text-neutral-900">{firstLine}</span>
      <br />
      <span className="text-neutral-900">{secondLine}</span>
      {cursor}
    </>
  )
}

export default function HeroSection() {
  return (
    <>
      <AdminBanners />

      <section className="relative overflow-hidden">
        {/* Layered background: gradient fallback + optional image + scrim */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-secondary-100 via-primary-50 to-secondary-200"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/back.jpg)' }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(58_107_85/0.08)_1px,transparent_0)] bg-[length:24px_24px]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/20 via-neutral-900/10 to-neutral-900/35"
          aria-hidden
        />

        <div className="section-inner relative py-16 md:py-24 lg:py-28">
          <motion.div
            variants={fadeUpLg}
            initial="hidden"
            animate="visible"
            transition={{ ...transitions.slow, delay: 0.1 }}
            className="mx-auto max-w-3xl rounded-modal border border-white/50 bg-white/75 p-8 shadow-elevated backdrop-blur-md md:p-12"
          >
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="mb-5 flex items-center justify-center gap-2"
            >
              <span className="inline-flex items-center gap-2 rounded-pill bg-primary-50 px-3 py-1 text-caption font-semibold uppercase tracking-wider text-primary-700">
                <Sparkles className="h-4 w-4" />
                AR-Enabled Shopping
              </span>
            </motion.div>

            <h1 className="mb-5 min-h-[4rem] text-center text-hero text-neutral-900 md:min-h-[5rem] md:text-hero-md lg:text-hero-lg">
              <TypewriterHeadline />
            </h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.35 }}
              className="mx-auto mb-8 max-w-2xl text-center text-body text-neutral-600 md:text-lg"
            >
              Discover modern furniture designed for your lifestyle. Visualize in AR before you buy.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.45 }}
              className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            >
              <Link
                to="/products"
                className="btn btn-primary btn-lg btn-pill w-full sm:w-auto"
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/products?featured=true"
                className="btn btn-outline btn-lg btn-pill w-full sm:w-auto"
              >
                Featured Collection
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
