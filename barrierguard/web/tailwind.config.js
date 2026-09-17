/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A0F1D',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        oil: {
          blue: '#1D4ED8',
          accent: '#2563EB',
          light: '#EFF6FF',
          dark: '#1E3A8A'
        },
        risk: {
          high: '#DC2626',
          'high-bg': '#FEF2F2',
          'high-border': '#FECACA',
          medium: '#EA580C',
          'medium-bg': '#FFF7ED',
          'medium-border': '#FFEDD5',
          low: '#16A34A',
          'low-bg': '#F0FDF4',
          'low-border': '#BBF7D0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
