/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        puja: {
          bg: '#120909',
          'maroon-dark': '#2A0B0B',
          maroon: '#4A1010',
          sindoor: '#B51218',
          'red-warm': '#D1261F',
          'gold-antique': '#D4AF37',
          'gold-warm': '#E7C766',
          cream: '#F5E6C8',
          'white-warm': '#FFF8EC',
        },
        sindoor: {
          50: '#FFF5F5',
          100: '#FFE3E3',
          200: '#FFC9C9',
          300: '#FFA8A8',
          400: '#FF6B6B',
          500: '#D1261F',
          600: '#B51218',
          700: '#8E0D12',
          800: '#6B090E',
          900: '#4A1010',
          950: '#2A0B0B',
        },
        gold: {
          50: '#FFFDF5',
          100: '#FFF8EC',
          200: '#F5E6C8',
          300: '#EED9A0',
          400: '#E7C766',
          500: '#D4AF37',
          600: '#B89428',
          700: '#94741B',
          800: '#6F5412',
          900: '#4E390A',
          950: '#2E2105',
        },
        night: {
          800: '#3D1515',
          850: '#2A0B0B',
          900: '#1C0E0E',
          950: '#120909',
          DEFAULT: '#120909',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FFF8EC',
          200: '#F5E6C8',
          300: '#E8D4B0',
          400: '#D6BE93',
          500: '#BFA577',
        },
      },
      fontFamily: {
        bengali: ['"Noto Serif Bengali"', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        sans: ['"Inter"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      animation: {
        'flame-flicker': 'flicker 2.5s infinite ease-in-out',
        'subtle-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'incense-drift': 'incense 8s ease-in-out infinite',
        'gold-shimmer': 'shimmer 4s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '0.95', transform: 'scale(1)' },
          '25%': { opacity: '0.8', transform: 'scale(0.97) rotate(-0.5deg)' },
          '50%': { opacity: '0.7', transform: 'scale(0.94)' },
          '75%': { opacity: '0.85', transform: 'scale(0.98) rotate(0.5deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        incense: {
          '0%, 100%': { opacity: '0.3', transform: 'translate(0, 0) scale(1)' },
          '50%': { opacity: '0.6', transform: 'translate(15px, -20px) scale(1.15)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
