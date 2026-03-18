/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F1A',
        surface: '#1A1A2E',
        surfaceHigh: '#252540',
        primary: '#6C63FF',
        primaryDim: '#4A44CC',
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
        textPrimary: '#F0F0FF',
        textSecondary: '#9090B0',
        textDim: '#5A5A7A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      maxWidth: {
        mobile: '393px',
      },
    },
  },
  plugins: [],
}

