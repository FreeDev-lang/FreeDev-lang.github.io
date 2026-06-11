/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ── "Maison" luxury palette: midnight ink · indigo · gold · porcelain ──
         The same brand system as the Fria Android app:
         midnight #0A0A0F · indigo #5B6FF0 · gold #E5C869.
         Token NAMES are unchanged so every page (storefront + both admin panels)
         re-skins without code changes. */
      colors: {
        primary: {
          50:  '#eef1fe',
          100: '#e0e5fd',
          200: '#c7cffb',
          300: '#a5b1f8',
          400: '#7f8df4',
          500: '#5B6FF0',
          600: '#4757d8',
          700: '#3a45b2',
          800: '#323b8e',
          900: '#2d3572',
          DEFAULT: '#5B6FF0',
        },
        /* Porcelain / stone — the quiet gallery surfaces. */
        secondary: {
          50:  '#FBFAF7',
          100: '#F5F3EE',
          200: '#EAE7DD',
          300: '#D9D4C5',
          400: '#BCB5A1',
          500: '#9C947E',
          600: '#7F7763',
          700: '#665F50',
          800: '#544E42',
          900: '#474238',
          DEFAULT: '#F5F3EE',
        },
        /* Brass / gold — the jewellery. */
        accent: {
          50:  '#fdf9ec',
          100: '#faf1d3',
          200: '#f4e2a6',
          300: '#edd482',
          400: '#E5C869',
          500: '#d4ad45',
          600: '#b78c33',
          700: '#92682b',
          800: '#785328',
          900: '#664525',
          DEFAULT: '#E5C869',
        },
        /* Ink — midnight-tinted neutrals. */
        neutral: {
          50:  '#f7f7f9',
          100: '#ededf1',
          200: '#dadae1',
          300: '#bbbbc6',
          400: '#9292a0',
          500: '#71717f',
          600: '#575763',
          700: '#42424c',
          800: '#28282f',
          900: '#141419',
          DEFAULT: '#71717f',
        },
        midnight: '#0A0A0F',
      },

      fontFamily: {
        sans: ['"DM Sans"', 'Almarai', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Playfair Display"', 'Amiri', 'Georgia', 'serif'],
      },

      fontSize: {
        hero: ['3rem', { lineHeight: '1.08', letterSpacing: '-0.01em', fontWeight: '500' }],
        'hero-md': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.015em', fontWeight: '500' }],
        'hero-lg': ['5rem', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '500' }],
        h1: ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h1-md': ['2.5rem', { lineHeight: '1.12', letterSpacing: '-0.012em', fontWeight: '600' }],
        h2: ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.008em', fontWeight: '600' }],
        'h2-md': ['2rem', { lineHeight: '1.18', letterSpacing: '-0.01em', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.005em', fontWeight: '600' }],
        'h3-md': ['1.625rem', { lineHeight: '1.22', letterSpacing: '-0.006em', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.65', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1.45', letterSpacing: '0.04em', fontWeight: '500' }],
        eyebrow: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.22em', fontWeight: '600' }],
      },

      borderRadius: {
        btn: '0.75rem',
        card: '1.25rem',
        input: '0.75rem',
        pill: '9999px',
        modal: '1.5rem',
        frame: '1.5rem',
      },

      boxShadow: {
        'card-default': '0 1px 2px 0 rgb(10 10 15 / 0.04), 0 2px 8px -2px rgb(10 10 15 / 0.06)',
        'card-hover': '0 12px 32px -8px rgb(10 10 15 / 0.14), 0 4px 12px -4px rgb(45 53 114 / 0.10)',
        elevated: '0 24px 48px -16px rgb(10 10 15 / 0.22), 0 8px 20px -8px rgb(45 53 114 / 0.12)',
        overlay: '0 24px 56px -12px rgb(10 10 15 / 0.28), 0 12px 24px -8px rgb(10 10 15 / 0.16)',
        'gold-glow': '0 0 0 1px rgb(229 200 105 / 0.35), 0 8px 32px -8px rgb(229 200 105 / 0.35)',
        'ink-glow': '0 18px 44px -14px rgb(10 10 15 / 0.55)',
      },

      spacing: {
        'section-y': '4.5rem',
        'section-y-md': '6rem',
        'section-y-lg': '7.5rem',
        'card-gap': '1.5rem',
        'card-gap-md': '2rem',
      },

      maxWidth: {
        content: '80rem',
      },

      transitionDuration: {
        brand: '250ms',
      },

      transitionTimingFunction: {
        brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      backgroundImage: {
        'gold-sheen':
          'linear-gradient(110deg, transparent 30%, rgb(229 200 105 / 0.18) 48%, rgb(229 200 105 / 0.32) 52%, transparent 70%)',
        'midnight-radial':
          'radial-gradient(80% 90% at 70% 10%, rgb(91 111 240 / 0.16) 0%, transparent 60%), radial-gradient(60% 70% at 15% 85%, rgb(229 200 105 / 0.08) 0%, transparent 55%)',
      },

      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sheen-sweep': {
          '0%': { backgroundPosition: '-150% 0' },
          '100%': { backgroundPosition: '250% 0' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'sheen-sweep': 'sheen-sweep 3.2s ease-in-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
