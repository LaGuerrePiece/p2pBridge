const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.vue', './public/index.html',],
  theme: {
    screens: {
    xs: '475px',
    ...defaultTheme.screens,
      },
  },
  variants: {},
  plugins: [],
}

