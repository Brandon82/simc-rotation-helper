/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // WoW class colors
        'wow-death-knight': '#C41E3A',
        'wow-demon-hunter': '#A330C9',
        'wow-druid': '#FF7C0A',
        'wow-evoker': '#33937F',
        'wow-hunter': '#AAD372',
        'wow-mage': '#3FC7EB',
        'wow-monk': '#00FF98',
        'wow-paladin': '#F48CBA',
        'wow-priest': '#FFFFFF',
        'wow-rogue': '#FFF468',
        'wow-shaman': '#0070DD',
        'wow-warlock': '#8788EE',
        'wow-warrior': '#C69B3A',
      },
    },
  },
  plugins: [],
};
