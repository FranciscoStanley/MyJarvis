import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#0a0e17',
          surface: '#111827',
          border: '#1e293b',
          cyan: '#22d3ee',
          gold: '#fbbf24',
          glow: '#06b6d4',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        orbit: 'orbit 8s linear infinite',
        scanline: 'scanline 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow:
              '0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.05)',
          },
          '50%': {
            boxShadow:
              '0 0 60px rgba(34, 211, 238, 0.6), 0 0 100px rgba(6, 182, 212, 0.2), inset 0 0 30px rgba(34, 211, 238, 0.1)',
          },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      minHeight: {
        dvh: '100dvh',
      },
      height: {
        dvh: '100dvh',
      },
    },
  },
  plugins: [],
};
export default config;
