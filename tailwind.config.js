/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      serif: ['PT Serif', 'serif'],
      mono: ['Fira Code', 'monospace'],
    },
    extend: {

    },
  },
  plugins: [],
};
