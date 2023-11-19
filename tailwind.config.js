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
      colors: {
        navy: {
          50: '#f4f7fb',
          100: '#e7f0f7',
          200: '#cbdeec',
          300: '#9dc3dc',
          400: '#68a3c8',
          500: '#4487b3',
          600: '#336c96',
          700: '#2a577a',
          800: '#264b66',
          900: '#27445c',
        },
      },
    },
  },
  plugins: [],
};
