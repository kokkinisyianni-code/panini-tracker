import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#F5A623',
        'gold-light': '#FFD166',
        green: '#06D6A0',
        red: '#EF233C',
        blue: '#4361EE',
        purple: '#7209B7',
        'bg-dark': '#080C14',
        'bg-card': '#0F1623',
        'bg-card2': '#141C2E',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
