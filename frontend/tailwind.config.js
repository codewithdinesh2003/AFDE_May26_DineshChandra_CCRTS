/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1d4ed8',
        surface: '#0f172a',
        card: '#1e293b',
        border: '#334155',
      },
      fontFamily: {
        sans: ['Sora', 'DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
