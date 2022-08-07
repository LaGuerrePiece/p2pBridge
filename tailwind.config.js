const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.vue', './public/index.html', "./node_modules/flowbite/**/*.js"],
  theme: {
    screens: {
    xs: '475px',
    ...defaultTheme.screens,
      },
  },
  variants: {},
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#4974a5",
          "secondary": "#144256",
          "accent": "#F471B5",
          "neutral": "#1D283A",
          "base-100": "#0F1729",
          "info": "#0CA6E9",
          "success": "#2BD4BD",
          "warning": "#F4C152",
          "error": "#FB6F84",
        },
      },
    ],
  },
}

