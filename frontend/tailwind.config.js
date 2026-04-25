/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rajdhani', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Orbitron', 'monospace'],
        mono: ['Orbitron', 'monospace'],
      },
      colors: {
        surface: {
          50: '#e6f0ff',
          100: '#b3d4ff',
          200: '#80b8ff',
          300: '#4d9cff',
          400: '#1a80ff',
          500: '#0066e6',
          600: '#0050b3',
          700: '#003a80',
          800: '#0A0F2C',
          900: '#060B1A',
          950: '#050A18',
        },
        primary: {
          50: '#e6f7ff',
          100: '#b3e5ff',
          200: '#80d4ff',
          300: '#4dc2ff',
          400: '#1ab0ff',
          500: '#00AAFF',
          600: '#0080cc',
          700: '#005599',
          800: '#003066',
          900: '#001a33',
        },
        neon: {
          blue: '#00AAFF',
          cyan: '#00D4FF',
          electric: '#1E90FF',
          violet: '#8B5CF6',
          emerald: '#00FF9D',
          amber: '#FFB800',
          rose: '#FF3366',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow-cyan': '0 0 30px rgba(0, 170, 255, 0.2), 0 0 60px rgba(0, 170, 255, 0.05)',
        'glow-blue': '0 0 30px rgba(30, 144, 255, 0.2), 0 0 60px rgba(30, 144, 255, 0.05)',
        'glow-violet': '0 0 30px rgba(139, 92, 246, 0.2), 0 0 60px rgba(139, 92, 246, 0.05)',
        'neon-blue': '0 0 10px rgba(0, 170, 255, 0.3), 0 0 20px rgba(0, 170, 255, 0.15), 0 0 40px rgba(0, 170, 255, 0.05)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 170, 255, 0.05)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'border-pulse': 'borderPulse 3s ease-in-out infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'holographic': 'holographicRotate 8s linear infinite',
      },
    },
  },
  plugins: [],
};