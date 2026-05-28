import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Syne', 'sans-serif'],
        body: ['var(--font-body)', 'DM Sans', 'sans-serif'],
      },
      colors: {
        saffron: {
          DEFAULT: '#FF6B00',
          dim: '#CC5500',
          glow: 'rgba(255,107,0,0.15)',
        },
        teal: {
          DEFAULT: '#00BFA5',
          dim: '#009688',
        },
        surface: {
          base: '#0A0A0A',
          card: '#141414',
          raised: '#1C1C1C',
          hover: '#242424',
        },
        border: {
          DEFAULT: '#2A2A2A',
          bright: '#3A3A3A',
        },
        cream: '#F0EBE1',
        'text-primary': '#F0EBE1',
        'text-secondary': '#9E9690',
        'text-muted': '#5C5750',
        'red-err': '#EF5350',
        amber: '#FFB300',
        indigo: '#5C6BC0',
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
        'pulse-saffron': 'pulse-saffron 2s ease-in-out infinite',
        'chain-link': 'chain-link 0.4s ease forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 50%' },
          '100%': { backgroundPosition: '-200% 50%' },
        },
        'pulse-saffron': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,0,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255,107,0,0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
