const defaultConfig = require('tailwindcss/defaultConfig')

/** @type {import('tailwindcss/types').Config} */
const config = {
  content: ['index.html', 'src/**/*.tsx'],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultConfig.theme.fontFamily.sans]
    },
    extend: {
      colors: {
        'upcoming-background': '#272828',
        'past-background': '#4a4a4a'
      }
    }
  }
}
module.exports = config
