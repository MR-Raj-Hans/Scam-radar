/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A0F1E',
          light: '#111827',
          lighter: '#1a2235',
          card: '#0d1428',
        },
        red: {
          DEFAULT: '#FF2D55',
          dark: '#CC2244',
          light: '#FF5577',
          glow: 'rgba(255,45,85,0.3)',
        },
        accent: {
          blue: '#00B4FF',
          green: '#00FF88',
          yellow: '#FFD700',
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A0F1E 0%, #1a0a20 50%, #0A0F1E 100%)',
        'card-gradient': 'linear-gradient(145deg, #111827, #0d1428)',
        'red-gradient': 'linear-gradient(135deg, #FF2D55, #CC2244)',
        'glow-red': 'radial-gradient(circle at center, rgba(255,45,85,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(255, 45, 85, 0.4)',
        'glow-red-lg': '0 0 40px rgba(255, 45, 85, 0.5), 0 0 80px rgba(255, 45, 85, 0.2)',
        'glow-blue': '0 0 20px rgba(0, 180, 255, 0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(255,45,85,0.2), 0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'pulse-red': 'pulseRed 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 3s linear infinite',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(255,45,85,0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(255,45,85,0.7), 0 0 60px rgba(255,45,85,0.3)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
