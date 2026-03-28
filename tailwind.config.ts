import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg:      '#FAFAFA',
          sidebar: '#F7F7F5',
          hover:   '#EFEFEF',
          border:  '#E5E5E3',
          text:    '#37352F',
          muted:   '#9B9A97',
          accent:  '#0F7B6C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
