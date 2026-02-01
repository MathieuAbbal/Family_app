/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        family: {
          pink:    '#FF6B9D',
          coral:   '#FF8A65',
          orange:  '#FFB74D',
          yellow:  '#FFD54F',
          green:   '#81C784',
          sky:     '#64B5F6',
          purple:  '#BA68C8',
          lavender:'#CE93D8',
        },
        warm: {
          50:  '#FFF8F0',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
        },
        surface: {
          card:    '#FFFFFF',
          overlay: 'rgba(255,255,255,0.85)',
          muted:   '#FFF5EE',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      fontFamily: {
        display: ['"Nunito"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'fun': '0 4px 20px rgba(255, 107, 157, 0.15)',
        'card': '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(255, 107, 157, 0.2)',
      },
    },
  },
  plugins: [],
}
