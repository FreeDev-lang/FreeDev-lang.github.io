import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Truck, BadgeCheck, Smartphone, QrCode } from 'lucide-react'
import { productsApi } from '../lib/api'
import ProductCard from '../components/ProductCard'
import HeroSection from '../components/HeroSection'
import { motion } from 'framer-motion'
import { fadeUp, sectionEntrance } from '../utils/motion'
import { useTranslation } from '../utils/i18n'

export default function Home() {
  const { t } = useTranslation()
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeatured(8).then(res => res.data),
  })

  return (
    <div>
      <HeroSection />

      {/* Featured — the gallery wall */}
      <section className="section section-inner">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3 flex items-center gap-3">
              <span className="gold-rule w-8" aria-hidden />
              {t('home.featuredEyebrow')}
            </p>
            <h2 className="font-display text-h2 md:text-h2-md text-neutral-900">
              {t('home.featuredTitle')}
            </h2>
          </div>
          <Link
            to="/products?featured=true"
            className="nav-link inline-flex items-center gap-2 border-b border-accent-400/60 pb-0.5 hover:border-accent-500"
          >
            {t('home.viewAll')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <motion.div
            className="card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            variants={sectionEntrance}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {featured.map((product: any) => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-body text-neutral-500">{t('common.loading')}</p>
          </div>
        )}
      </section>

      {/* The promises — quiet editorial triptych */}
      <section className="section bg-secondary-100">
        <div className="section-inner">
          <div className="card-grid grid grid-cols-1 gap-card-gap-md md:grid-cols-3">
            {[
              { icon: Sparkles, title: t('home.valueArTitle'), body: t('home.valueArBody') },
              { icon: Truck, title: t('home.valueDeliveryTitle'), body: t('home.valueDeliveryBody') },
              { icon: BadgeCheck, title: t('home.valueQualityTitle'), body: t('home.valueQualityBody') },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-pill border border-accent-400/50 bg-accent-50">
                  <Icon className="h-7 w-7 text-accent-600" />
                </div>
                <h3 className="font-display text-h3 mb-2">{title}</h3>
                <p className="text-body-sm text-neutral-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The app — midnight invitation band */}
      <section className="section section-inner">
        <div className="surface-midnight relative overflow-hidden px-6 py-12 md:px-14 md:py-16">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(229_200_105/0.06)_1px,transparent_0)] bg-[length:26px_26px]"
            aria-hidden
          />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow-on-dark mb-4 flex items-center gap-3">
                <span className="gold-rule w-8" aria-hidden />
                {t('home.appEyebrow')}
              </p>
              <h2 className="font-display text-h2 md:text-h2-md text-secondary-50">
                {t('home.appTitle')}{' '}
                <em className="text-accent-400">{t('home.appTitleAccent')}</em>
              </h2>
              <p className="mt-4 max-w-md text-body-sm text-neutral-400">
                {t('home.appBody')}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/download" className="btn btn-accent">
                  <Smartphone className="h-4 w-4" />
                  {t('nav.getApp')}
                </Link>
                <Link to="/download" className="btn btn-outline-light">
                  <QrCode className="h-4 w-4" />
                  {t('home.appQrCta')}
                </Link>
              </div>
            </div>

            {/* A floating phone silhouette with the F· mark — pure CSS, no asset. */}
            <div className="hidden justify-center lg:flex">
              <div className="animate-float-slow relative h-[22rem] w-[11rem] rounded-[2.4rem] border border-secondary-50/15 bg-gradient-to-b from-neutral-900 to-midnight p-2 shadow-elevated">
                <div className="absolute left-1/2 top-3.5 h-1 w-12 -translate-x-1/2 rounded-pill bg-secondary-50/15" aria-hidden />
                <div className="flex h-full w-full items-center justify-center rounded-[1.9rem] bg-midnight-radial border border-secondary-50/5">
                  <span className="font-display text-6xl font-semibold text-primary-400">
                    F<span className="text-accent-400">·</span>
                  </span>
                </div>
                <span className="absolute -right-7 top-10 rounded-pill bg-accent-400 px-3 py-1 text-caption font-bold text-midnight shadow-gold-glow">
                  1:1
                </span>
                <span className="absolute -left-8 bottom-16 rounded-pill border border-primary-400/50 bg-midnight px-3 py-1 text-caption font-semibold text-primary-300">
                  AR
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
