/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        haleon: {
          black: '#000000',
          lime: '#39FF14', // Bright neon green
          gray: {
            100: '#FFFFFF',
            200: '#F8F8F8',
            300: '#EEEEEE',
            400: '#DDDDDD',
            500: '#999999',
            600: '#666666',
            700: '#444444',
            800: '#222222',
            900: '#111111',
          }
        }
      },
      fontFamily: {
        sans: ['Proxima Nova', 'system-ui', 'sans-serif'],
        display: ['Haleon Display', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
};