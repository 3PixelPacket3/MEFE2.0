/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#FDF5F3',
          100: '#FBE8E4',
          200: '#F7D1C9',
          300: '#F0B3A6',
          400: '#EA8F7B',
          500: '#E2725B', // Primary
          600: '#C75842',
          700: '#A44330',
          800: '#833425',
          900: '#672A1F',
          DEFAULT: '#E2725B',
        },
        cocoa: {
          50: '#F7F5F5',
          100: '#EDE9E9',
          200: '#DDD5D5',
          300: '#C2B5B5',
          400: '#7E6B6B',
          500: '#544242',
          600: '#3C2F2F', // Secondary
          700: '#2F2424',
          800: '#221919',
          900: '#171111',
          DEFAULT: '#3C2F2F',
        },
        warm: {
          50: '#FAF8F5',
          100: '#F5EFEB',
          200: '#EFE7E0',
          300: '#E4D8CE',
          400: '#D5C4B7',
          500: '#C2ACA0',
          bg: '#FAF6F0',
          card: '#FFFFFF',
          border: '#E8DED6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(60, 47, 47, 0.05)',
        'warm-md': '0 4px 12px rgba(60, 47, 47, 0.08)',
        'warm-lg': '0 10px 25px rgba(60, 47, 47, 0.12)',
        'terracotta': '0 4px 14px rgba(226, 114, 91, 0.35)',
      }
    },
  },
  plugins: [],
}
