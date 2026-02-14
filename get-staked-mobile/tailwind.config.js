/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors
        'bg-primary': '#06060A',
        'bg-surface': '#0E0E18',
        'bg-elevated': '#161625',
        'bg-hover': '#1C1C30',
        
        'brand-fire': '#FF6B2C',
        'brand-gold': '#F5B731',
        'brand-ember': '#FF4500',
        
        'success': '#00E878',
        'danger': '#FF2D55',
        'warning': '#FFB020',
        'info': '#5B7FFF',
        
        'text-primary': '#F2F2F7',
        'text-secondary': '#8888A0',
        'text-muted': '#4A4A60',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
