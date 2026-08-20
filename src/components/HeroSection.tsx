import { Link } from 'react-router-dom'
import { ArrowRight, Smartphone, ArrowUpRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { marketingApi } from '../lib/api'
import { sizedImage, IMG } from '../lib/sizedImage'
import { useTranslation } from '../utils/i18n'
import { fadeUp, fadeUpLg, transitions } from '../utils/motion'

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
                    src={sizedImage(banner.imageUrl, IMG.hero, 80)}
                    alt={banner.title || 'Promotional banner'}
                    className="h-full w-full object-cover transition-transform duration-brand group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-primary-100 via-secondary-100 to-accent-100" />
                )}

                {(banner.title || banner.description) && (
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-midnight/60 via-midnight/15 to-transparent p-4 sm:p-5">
                    {banner.title && (
                      <h3 className="font-sans text-body-sm sm:text-base font-semibold text-white line-clamp-1">
                        {banner.title}
                      </h3>
                    )}
                    {banner.description && (
                      <p className="mt-0.5 text-caption text-white/85 line-clamp-2 sm:line-clamp-1">
                        {banner.description}
                      </p>
                    )}
                    {banner.linkText && banner.linkUrl && (
                      <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-pill bg-accent-400 px-3 py-1 text-caption font-semibold text-midnight transition-colors group-hover:bg-accent-300">
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

/**
 * The Maison hero: a full-bleed midnight gallery wall. Editorial serif headline with a gold
 * italic accent, quiet supporting copy, and two CTAs — the collection and the AR app.
 */
export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <>
      <section className="relative overflow-hidden bg-midnight">
        {/* Layered backdrop: photo, ink scrim, brand glows, faint gold grid. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: 'url(/back.jpg)' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/85 to-midnight/40" aria-hidden />
        <div className="absolute inset-0 bg-midnight-radial" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(229_200_105/0.07)_1px,transparent_0)] bg-[length:28px_28px]"
          aria-hidden
        />
        {/* Hairline ring — quiet ambient geometry, like the app's Welcome screen. */}
        <div
          className="pointer-events-none absolute -right-40 -top-40 hidden h-[34rem] w-[34rem] rounded-full border border-accent-400/15 lg:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 hidden h-[22rem] w-[22rem] rounded-full border border-primary-400/15 lg:block"
          aria-hidden
        />

        <div className="section-inner relative py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.base, delay: 0.05 }}
              className="eyebrow-on-dark mb-6 flex items-center gap-3"
            >
              <span className="gold-rule w-8" aria-hidden />
              {t('home.heroEyebrow')}
            </motion.p>

            <motion.h1
              variants={fadeUpLg}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.slow, delay: 0.15 }}
              className="font-display text-hero text-secondary-50 md:text-hero-md lg:text-hero-lg"
            >
              {t('home.heroTitle')}{' '}
              <em className="text-accent-400">{t('home.heroTitleAccent')}</em>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.base, delay: 0.35 }}
              className="mt-7 max-w-xl text-body text-neutral-300 md:text-lg"
            >
              {t('home.heroSub')}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.base, delay: 0.5 }}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <Link to="/products" className="btn btn-accent btn-lg w-full sm:w-auto">
                {t('home.heroCtaShop')}
                <ArrowRight className="h-5 w-5 rtl:rotate-180" />
              </Link>
              <Link to="/download" className="btn btn-outline-light btn-lg w-full sm:w-auto">
                <Smartphone className="h-5 w-5" />
                {t('nav.getApp')}
                <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
              </Link>
            </motion.div>

            {/* Quiet promise strip */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.base, delay: 0.65 }}
              className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-secondary-50/10 pt-6"
            >
              {[t('home.promiseAr'), t('home.promiseCurated'), t('home.promiseDelivery')].map(
                (promise) => (
                  <span key={promise} className="flex items-center gap-2 text-caption uppercase tracking-[0.18em] text-neutral-400">
                    <span className="h-1 w-1 rounded-full bg-accent-400" aria-hidden />
                    {promise}
                  </span>
                ),
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <AdminBanners />
    </>
  )
}
