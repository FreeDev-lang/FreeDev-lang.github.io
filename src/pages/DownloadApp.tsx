import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  Download,
  ShieldCheck,
  Smartphone,
  PackageOpen,
  Sparkles,
  CheckCircle2,
  Camera,
  Ruler,
  Globe2,
} from 'lucide-react'
import { useTranslation } from '../utils/i18n'
import { fadeUp, fadeUpLg, sectionEntrance, transitions } from '../utils/motion'

const APK_FILE = 'fria.apk'
const APK_SIZE = '18 MB'
const MIN_ANDROID = 'Android 7.0+'

/** Absolute URL of the APK (works in dev, on GitHub Pages, and behind any base path). */
function apkUrl(): string {
  return new URL(`${import.meta.env.BASE_URL}${APK_FILE}`, window.location.origin).toString()
}

/**
 * The "Get the app" page: a direct, store-less APK download with a guided install.
 * Midnight gallery treatment — the page itself is part of the pitch.
 */
export default function DownloadApp() {
  const { t } = useTranslation()
  const url = apkUrl()

  const steps = [
    {
      icon: Download,
      title: t('download.step1Title'),
      body: t('download.step1Body'),
    },
    {
      icon: ShieldCheck,
      title: t('download.step2Title'),
      body: t('download.step2Body'),
    },
    {
      icon: PackageOpen,
      title: t('download.step3Title'),
      body: t('download.step3Body'),
    },
    {
      icon: Sparkles,
      title: t('download.step4Title'),
      body: t('download.step4Body'),
    },
  ]

  const features = [
    { icon: Camera, text: t('download.featureAr') },
    { icon: Ruler, text: t('download.featureScale') },
    { icon: Globe2, text: t('download.featureLangs') },
  ]

  return (
    <div>
      {/* ── Midnight hero ── */}
      <section className="relative overflow-hidden bg-midnight">
        <div className="absolute inset-0 bg-midnight-radial" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(229_200_105/0.07)_1px,transparent_0)] bg-[length:28px_28px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-44 -bottom-44 h-[30rem] w-[30rem] rounded-full border border-primary-400/15"
          aria-hidden
        />

        <div className="section-inner relative grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2">
          <div>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.base, delay: 0.05 }}
              className="eyebrow-on-dark mb-6 flex items-center gap-3"
            >
              <span className="gold-rule w-8" aria-hidden />
              {t('download.eyebrow')}
            </motion.p>

            <motion.h1
              variants={fadeUpLg}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.slow, delay: 0.15 }}
              className="font-display text-hero md:text-hero-md text-secondary-50"
            >
              {t('download.title')}{' '}
              <em className="text-accent-400">{t('download.titleAccent')}</em>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.base, delay: 0.3 }}
              className="mt-6 max-w-lg text-body text-neutral-300"
            >
              {t('download.sub')}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.base, delay: 0.45 }}
              className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <a href={url} download className="btn btn-accent btn-lg w-full sm:w-auto">
                <Download className="h-5 w-5" />
                {t('download.cta')}
              </a>
              <span className="text-caption uppercase tracking-[0.18em] text-neutral-400">
                {APK_SIZE} · {MIN_ANDROID} · {t('download.free')}
              </span>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.base, delay: 0.6 }}
              className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-secondary-50/10 pt-6"
            >
              {features.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2 text-body-sm text-neutral-300">
                  <Icon className="h-4 w-4 text-accent-400" />
                  {text}
                </span>
              ))}
            </motion.div>
          </div>

          {/* QR + phone composition */}
          <motion.div
            variants={fadeUpLg}
            initial="hidden"
            animate="visible"
            transition={{ ...transitions.slow, delay: 0.3 }}
            className="flex items-center justify-center gap-8"
          >
            <div className="animate-float-slow relative hidden h-[24rem] w-[12rem] rounded-[2.6rem] border border-secondary-50/15 bg-gradient-to-b from-neutral-900 to-midnight p-2 shadow-elevated sm:block">
              <div className="absolute left-1/2 top-4 h-1 w-12 -translate-x-1/2 rounded-pill bg-secondary-50/15" aria-hidden />
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[2.1rem] border border-secondary-50/5 bg-midnight-radial">
                <span className="font-display text-7xl font-semibold text-primary-400">
                  F<span className="text-accent-400">·</span>
                </span>
                <span className="text-eyebrow uppercase text-neutral-400">Fria</span>
              </div>
              <span className="absolute -right-8 top-12 rounded-pill bg-accent-400 px-3 py-1 text-caption font-bold text-midnight shadow-gold-glow">
                1:1
              </span>
            </div>

            <div className="rounded-card border border-secondary-50/15 bg-secondary-50 p-5 text-center shadow-gold-glow">
              <QRCodeSVG value={url} size={148} bgColor="#FBFAF7" fgColor="#0A0A0F" />
              <p className="mt-3 max-w-[10rem] text-caption text-neutral-600">
                {t('download.qrHint')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Install steps ── */}
      <section className="section section-inner">
        <div className="mb-12 text-center">
          <p className="eyebrow mb-3 flex items-center justify-center gap-3">
            <span className="gold-rule w-8" aria-hidden />
            {t('download.stepsEyebrow')}
            <span className="gold-rule w-8" aria-hidden />
          </p>
          <h2 className="font-display text-h2 md:text-h2-md">{t('download.stepsTitle')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-body-sm text-neutral-600">
            {t('download.stepsSub')}
          </p>
        </div>

        <motion.ol
          className="grid grid-cols-1 gap-card-gap sm:grid-cols-2 lg:grid-cols-4"
          variants={sectionEntrance}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {steps.map(({ icon: Icon, title, body }, index) => (
            <motion.li key={title} variants={fadeUp} className="card-hover relative flex flex-col">
              <span className="font-display absolute -top-4 ltr:right-5 rtl:left-5 text-5xl font-semibold text-secondary-200 select-none" aria-hidden>
                {index + 1}
              </span>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-pill border border-accent-400/50 bg-accent-50">
                <Icon className="h-5 w-5 text-accent-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-900">{title}</h3>
              <p className="mt-2 text-body-sm text-neutral-600">{body}</p>
            </motion.li>
          ))}
        </motion.ol>

        {/* Why not the Play Store + trust note */}
        <div className="mx-auto mt-12 max-w-3xl rounded-card border border-secondary-200 bg-secondary-100 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-midnight">
              <ShieldCheck className="h-5 w-5 text-accent-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-neutral-900">
                {t('download.trustTitle')}
              </h3>
              <p className="mt-2 text-body-sm leading-relaxed text-neutral-600">
                {t('download.trustBody')}
              </p>
              <ul className="mt-4 space-y-2">
                {[t('download.reqAndroid'), t('download.reqArOptional'), t('download.reqSpace')].map(
                  (req) => (
                    <li key={req} className="flex items-center gap-2 text-body-sm text-neutral-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-600" />
                      {req}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <a href={url} download className="btn btn-primary btn-lg">
            <Smartphone className="h-5 w-5" />
            {t('download.cta')}
          </a>
        </div>
      </section>
    </div>
  )
}
