/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'epunda': ['Epunda Slab', 'serif'],
      },
    },
  },
  plugins: [],
}
