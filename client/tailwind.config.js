/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        churchBlue: '#0f4c81',
        churchGold: '#d4af37',
      },
    },
  },
  plugins: [],
}

