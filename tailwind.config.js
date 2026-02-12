/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
      './index.html',
      './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          border: 'hsl(240 5.9% 90%)',
          background: 'hsl(240 10% 3.9%)',
          foreground: 'hsl(0 0% 98%)',
          ring: 'hsl(240 5% 64.9%)',
        },
      },
    },
    plugins: [],
  };
  