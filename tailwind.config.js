/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ── Warm modern furniture palette ── */
      colors: {
        primary: {
          50: '#f3f7f4',
          100: '#e3ede7',
          200: '#c5dacd',
          300: '#9abfb0',
          400: '#6a9d88',
          500: '#4a8169',
          600: '#3a6b55',
          700: '#2f5645',
          800: '#284538',
          900: '#223930',
          DEFAULT: '#3a6b55',
        },
        secondary: {
          50: '#faf9f7',
          100: '#f5f3ef',
          200: '#e8e4dc',
          300: '#d4cdc0',
          400: '#b8ae9c',
          500: '#9a8f7a',
          600: '#7d7260',
          700: '#645b4d',
          800: '#524a40',
          900: '#443e37',
          DEFAULT: '#f5f3ef',
        },
        accent: {
          50: '#fdf9ef',
          100: '#f9f0d9',
          200: '#f2dfb3',
          300: '#e8c882',
          400: '#dcaf52',
          500: '#c9952f',
          600: '#a67724',
          700: '#855b1f',
          800: '#6d4a20',
          900: '#5a3d1d',
          DEFAULT: '#c9952f',
        },
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          DEFAULT: '#71717a',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        hero: ['3rem', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '700' }],
        'hero-md': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        'hero-lg': ['4.5rem', { lineHeight: '1.02', letterSpacing: '-0.035em', fontWeight: '700' }],
        h1: ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1-md': ['2.5rem', { lineHeight: '1.12', letterSpacing: '-0.025em', fontWeight: '700' }],
        h2: ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
        'h2-md': ['2rem', { lineHeight: '1.18', letterSpacing: '-0.02em', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3-md': ['1.625rem', { lineHeight: '1.22', letterSpacing: '-0.012em', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1.45', letterSpacing: '0.02em', fontWeight: '500' }],
      },

      borderRadius: {
        btn: '0.5rem',
        card: '1rem',
        input: '0.625rem',
        pill: '9999px',
        modal: '1.25rem',
      },

      boxShadow: {
        'card-default': '0 1px 3px 0 rgb(34 57 48 / 0.06), 0 1px 2px -1px rgb(34 57 48 / 0.06)',
        'card-hover': '0 10px 24px -6px rgb(34 57 48 / 0.12), 0 4px 8px -4px rgb(34 57 48 / 0.08)',
        elevated: '0 20px 40px -12px rgb(34 57 48 / 0.18), 0 8px 16px -8px rgb(34 57 48 / 0.1)',
        overlay: '0 24px 48px -12px rgb(24 24 27 / 0.22), 0 12px 24px -8px rgb(24 24 27 / 0.14)',
      },

      spacing: {
        'section-y': '4rem',
        'section-y-md': '5rem',
        'section-y-lg': '6rem',
        'card-gap': '1.5rem',
        'card-gap-md': '2rem',
      },

      maxWidth: {
        content: '80rem',
      },

      transitionDuration: {
        brand: '200ms',
      },

      transitionTimingFunction: {
        brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
