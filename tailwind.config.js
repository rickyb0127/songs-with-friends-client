/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      'mobile': '200px',
      'tablet': '800px',
      'desktop': '1280px'
    },
    colors: {
      'white': 'var(--white)',
      'black': 'var(--black)',
      'marine-blue': 'var(--marine-blue)',
      'pastel-blue': 'var(--pastel-blue)',
      'light-blue': 'var(--light-blue)',
      'warning-red': 'var(--warning-red)',
      'success-green': 'var(--success-green)',
      'cool-gray': 'var(--cool-gray)',
      'light-gray': 'var(--light-gray)'
    },
    extend: {
      animation: {
        'ping-once': 'ping 600ms linear 1',
        'pulse-once': 'pulse 600ms linear 1'
      }
    },
  },
  plugins: [],
}
