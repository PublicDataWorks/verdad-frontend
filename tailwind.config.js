const defaultConfig = require('tailwindcss/defaultConfig')

/** @type {import('tailwindcss/types').Config} */
const config = {
  darkMode: ['class'],
  content: ['index.html', 'src/**/*.tsx'],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultConfig.theme.fontFamily.sans]
    },
    extend: {
      colors: {
        'text-blue': '#005EF4',
        'text-secondary': '#3F3F46',
        'dropdown-text': '#A1A1AA',
        'ghost-white': '#F9F9F9',
        'blue-accent': '#639FFF',
        'blue-light': '#E8F1FF',
        'blue-deep': '#337EF4',
        'blue-rich': '#004DC7',
        'header-blue': '#005EF4',
        'header-white': '#93C5FD',
        'missive-background-color': 'var(--missive-background-color)',
        'missive-blue-color': 'var(--missive-blue-color)',
        'missive-light-border-color': 'var(--missive-light-border-color)',
        'missive-border-radius': 'var(--missive-border-radius)',
        'missive-conversation-list-background-color': 'var(--missive-conversation-list-background-color)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        tertiary: '#A1A1AA',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
module.exports = config
