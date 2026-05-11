/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        red: {
          50:  '#FCEBEB',
          100: '#F7C1C1',
          500: '#E24B4A',
          700: '#A32D2D',
          900: '#501313',
        },
        teal: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          500: '#1D9E75',
          700: '#0F6E56',
          900: '#04342C',
        },
      },
    },
  },
  plugins: [],
}
