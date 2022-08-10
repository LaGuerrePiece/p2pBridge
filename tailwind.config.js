const defaultTheme = require('tailwindcss/defaultTheme');
const daisyui = require('daisyui');

module.exports = {
  content: ['./src/**/*.vue', './public/index.html'],
  theme: {
    screens: {
    xs: '475px',
    ...defaultTheme.screens,
      },
  },
  variants: {},
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          //"primary": "#4974a5",
          "primary": "#baa219",
          "secondary": "#003e5b",
          "accent": "#F471B5",
          "neutral": "#040a27",
          "base-100": "#0F1729",
          "info": "#0CA6E9",
          "success": "#2BD4BD",
          "warning": "#F4C152",
          "error": "#FB6F84",
        },
      },
      "night",
      "dark",
    ],
  },
}

