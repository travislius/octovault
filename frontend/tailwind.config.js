/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bbdaff',
          300: '#8cc3ff',
          400: '#56a1ff',
          500: '#2e7cff',
          600: '#1a5ff5',
          700: '#1249e1',
          800: '#153db6',
          900: '#17378f',
          950: '#122357',
        },
      },
    },
  },
  plugins: [],
}
