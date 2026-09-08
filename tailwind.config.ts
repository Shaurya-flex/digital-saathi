import type { Config } from 'tailwindcss';

// Design tokens mirror the CSS variables in src/styles/globals.css —
// the prototype's :root block is the single source of truth.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: '#232C6B', 2: '#39449b', soft: '#eef0fa' },
        marigold: { DEFAULT: '#E8A33D', soft: '#fdf3e2' },
        leaf: { DEFAULT: '#1B7A5A', soft: '#e6f3ee' },
        chilli: { DEFAULT: '#C0392B', soft: '#fbeceb' },
        paper: '#F7F5F0',
        ink: { DEFAULT: '#191b27', 2: '#5a5f72' },
      },
      borderRadius: { saathi: '14px', 'saathi-lg': '22px' },
      fontFamily: {
        display: ['"Baloo 2"', '"Mukta"', 'system-ui', 'sans-serif'],
        body: ['"Mukta"', 'system-ui', 'sans-serif'],
      },
    },
  },
  corePlugins: { preflight: false },
  plugins: [],
};
export default config;
