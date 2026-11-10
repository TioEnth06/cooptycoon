import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coop: {
          bg: '#FFF6E5',
          card: '#FFFFFF',
          yellow: '#FFC83D',
          green: '#6BBF59',
          red: '#E5604D',
          blue: '#7CC4F0',
          text: '#3B2F2F',
          muted: '#8A7A70',
        },
      },
      fontFamily: {
        heading: ['var(--font-fredoka)', 'sans-serif'],
        body: ['var(--font-nunito)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
