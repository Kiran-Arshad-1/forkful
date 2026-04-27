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
        background: 'var(--color-background)',       // warm-cream / near-black warm
        foreground: 'var(--color-foreground)',       // gray-800 / warm-white

        card: {
          DEFAULT: 'var(--color-card)',              // white / dark warm surface
          foreground: 'var(--color-card-foreground)', // gray-800 / warm-white
        },

        popover: {
          DEFAULT: 'var(--color-popover)',           // white / dark warm elevated
          foreground: 'var(--color-popover-foreground)', // gray-800 / warm-white
        },

        primary: {
          DEFAULT: 'var(--color-primary)',           // amber-600 / amber-400
          foreground: 'var(--color-primary-foreground)', // white / gray-800
        },

        secondary: {
          DEFAULT: 'var(--color-secondary)',         // emerald-600 / emerald-400
          foreground: 'var(--color-secondary-foreground)', // white / gray-800
        },

        accent: {
          DEFAULT: 'var(--color-accent)',            // red-600 / red-400
          foreground: 'var(--color-accent-foreground)', // white / gray-800
        },

        muted: {
          DEFAULT: 'var(--color-muted)',             // warm-gray-100 / dark warm muted
          foreground: 'var(--color-muted-foreground)', // gray-500 / gray-400
        },

        border: 'var(--color-border)',               // stone-200 / dark warm border
        input: 'var(--color-input)',                 // stone-200 / dark warm input
        ring: 'var(--color-ring)',                   // amber-600 / amber-400

        success: {
          DEFAULT: 'var(--color-success)',           // emerald-500 / emerald-400
          foreground: 'var(--color-success-foreground)', // white / gray-800
        },

        warning: {
          DEFAULT: 'var(--color-warning)',           // amber-400 / amber-300
          foreground: 'var(--color-warning-foreground)', // gray-800
        },

        error: {
          DEFAULT: 'var(--color-error)',             // red-500 / red-400
          foreground: 'var(--color-error-foreground)', // white / gray-800
        },

        destructive: {
          DEFAULT: 'var(--color-destructive)',       // red-500 / red-400
          foreground: 'var(--color-destructive-foreground)', // white / gray-800
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