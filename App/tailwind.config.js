/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    './pages/**/*.{html,js}',
    './components/**/*.{html,js}',
    

  ],
  theme: {
    extend: {
      colors: {
        'carrot-orange': {
          '50': '#fef9ee',
          '100': '#fef2d6',
          '200': '#fbe0ad',
          '300': '#f8c979',
          '400': '#f5a842',
          '500': '#f29226',
          '600': '#e37313',
          '700': '#bc5812',
          '800': '#964516',
          '900': '#783b16',
          '950': '#411c09',
        },
        'paws-play': {
          '50': '#F6C344', // principal
          '100': '#0D3455', // header
          //'200': '#F9F5F1', // fondo
          '200': '#B2DFDB', // fondo
          '300': '#333333', // texto elementos contraste
          '400': '#FFAB40', // fondo elementos
        },

      }
    },
  },
  plugins: [],
}

