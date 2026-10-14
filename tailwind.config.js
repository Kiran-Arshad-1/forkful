/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // ForkFul Brand Palette Tokens
        'deep-navy': '#061538',
        'royal-navy': '#0A2463',
        'royal-blue': '#0D2F83',
        'bright-navy': '#123B96',
        'forkful-gold': '#FBC33B',
        'pure-white': '#FFFFFF',
        'soft-white': '#DCE6FF',
        'muted-periwinkle': '#9FB5F5',
        'muted-blue': '#647DBA',
        'blue-border': '#1D4ED8',
        'subtle-border': '#254477',
        'dark-input': '#081C49',
        'hover-blue': '#17439B',
        'gold-tint': '#3C351E',
        'success-green': '#10D6A0',
        'warning-amber': '#FBBF24',
        'danger-red': '#FF4D5E',
        'info-blue': '#6385FF',

        // Semantic CSS Variable Mappings
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',

        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },

        popover: {
          DEFAULT: 'var(--color-popover)',
          foreground: 'var(--color-popover-foreground)',
        },

        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },

        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
        },

        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },

        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },

        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',

        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
        },

        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
        },

        error: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
        },

        destructive: {
          DEFAULT: 'var(--color-destructive)',
          foreground: 'var(--color-destructive-foreground)',
        },
      },

      fontFamily: {
        heading: ['Crimson Pro', 'Georgia', 'serif'],
        body: ['Source Sans 3', 'system-ui', 'sans-serif'],
        caption: ['Nunito Sans', 'system-ui', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Crimson Pro', 'Georgia', 'serif'],
      },

      fontSize: {
        'h1': ['2.5rem', { lineHeight: '1.2' }],
        'h2': ['2rem', { lineHeight: '1.25' }],
        'h3': ['1.5rem', { lineHeight: '1.3' }],
        'h4': ['1.25rem', { lineHeight: '1.4' }],
        'h5': ['1.125rem', { lineHeight: '1.5' }],
        'caption': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],
        'data': ['0.875rem', { lineHeight: '1.4' }],
      },

      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '18px',
        'xl': '24px',
        DEFAULT: '12px',
      },

      boxShadow: {
        'sm': '0 2px 4px rgba(217, 119, 6, 0.08)',
        'md': '0 4px 6px rgba(217, 119, 6, 0.10)',
        'lg': '0 8px 12px rgba(217, 119, 6, 0.12)',
        'xl': '0 12px 24px rgba(217, 119, 6, 0.14)',
        '2xl': '0 25px 50px -12px rgba(217, 119, 6, 0.15)',
        'warm-sm': '0 2px 4px rgba(217, 119, 6, 0.08)',
        'warm-md': '0 4px 6px rgba(217, 119, 6, 0.10)',
        'warm-lg': '0 8px 12px rgba(217, 119, 6, 0.12)',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },

      transitionTimingFunction: {
        'out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        DEFAULT: '250ms',
      },

      zIndex: {
        'navigation': '100',
        'modal': '200',
        'toast': '300',
      },

      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      maxWidth: {
        'prose': '75ch',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
};