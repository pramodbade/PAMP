/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dbe4ff',
          500: '#3b5bdb',
          600: '#3451c7',
          700: '#2c44b0',
          900: '#1a2a6e',
        },
      },
    },
  },
  plugins: [],
}
