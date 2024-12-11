const defaultConfig = require('tailwindcss/defaultConfig')

/** @type {import('tailwindcss/types').Config} */
const config = {
  darkMode: ['class', '[data-theme="dark"]'],
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
        tertiary: 'hsl(var(--tertiary))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))'
        },
        'blue-light': 'var(--blue-light)',
        blue: 'var(--blue)',
        'border-gray': 'var(--border-gray)',
        'text-secondary': 'var(--text-secondary)',
        'text-primary': 'var(--text-primary)',
        'icon-secondary': 'var(--icon-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-blue': 'var(--text-blue)',
        'icon-blue': 'var(--icon-blue)',
        'button-from': 'var(--button-from)',
        'button-to': 'var(--button-to)',
        'selected-from': 'var(--selected-from)',
        'selected-to': 'var(--selected-to)',
        'background-header-from': 'var(--background-header-from)',
        'background-header-to': 'var(--background-header-to)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          blue: 'var(--text-blue)',
          red: 'var(--text-red)',
          yellow: 'var(--text-yellow)',
          green: 'var(--text-green)',
          purple: 'var(--text-purple)',
          disable: 'var(--text-disable)'
        },

        icon: {
          primary: 'var(--icon-primary)',
          secondary: 'var(--icon-secondary)',
          tertiary: 'var(--icon-tertiary)',
          blue: 'var(--icon-blue)'
        },

        blue: {
          DEFAULT: 'var(--blue)',
          light: 'var(--blue-light)'
        },

        button: {
          from: 'var(--button-from)',
          to: 'var(--button-to)'
        },

        selected: {
          from: 'var(--selected-from)',
          to: 'var(--selected-to)'
        },

        'border-gray': {
          DEFAULT: 'var(--border-gray)',
          light: 'var(--border-gray-light)',
          dark: 'var(--border-gray-dark)'
        },

        'background-gray': {
          lightest: 'var(--background-gray-lightest)',
          light: 'var(--background-gray-light)',
          medium: 'var(--background-gray-medium)',
          dark: 'var(--background-gray-dark)',
          darkest: 'var(--background-gray-darkest)'
        },

        'background-blue': {
          light: 'var(--background-blue-light)',
          medium: 'var(--background-blue-medium)',
          dark: 'var(--background-blue-dark)'
        },
        missive: {
          background: 'var(--missive-background-color)',
          blue: 'var(--missive-blue-color)',
          'light-border': 'var(--missive-light-border-color)',
          'border-radius': 'var(--missive-border-radius)',
          'conversation-list-background': 'var(--missive-conversation-list-background-color)'
        },
        'border-gray-medium': 'hsla(240, 5%, 65%, 1)'
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
