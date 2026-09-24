/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        heritage: {
          primary: '#923C13', // Warm Chalukyan terracotta sandstone
          dark: '#6B2A0A',
          light: '#B25325',
          accent: '#C88A42', // Amber sandstone gold
          accentLight: '#F5E8D8',
          background: '#FDFBF7',
          surface: '#FFFFFF',
          text: '#231915', // Basalt charcoal
          textSecondary: '#5A463C',
          textMuted: '#8A7A70',
          success: '#2D7D46',
          warning: '#B8860B',
          error: '#C53030',
          border: '#E8DDD0',
        },
        chalukya: {
          terracotta: '#923C13',
          gold: '#7E5700',
          teal: '#2C5D67',
          cream: '#FFF8F6',
          sand: '#F6ECE8',
          stone: '#EBDCD6',
          basalt: '#231915',
          border: '#E4D5CE',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
