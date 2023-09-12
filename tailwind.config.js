/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      height: {
        '500': '500px',
      },
      fontFamily: {
        'brush-script': ['Brush Script MT', 'cursive'],
      },
    },
  },
  plugins: [],
}

