/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Design-reference dark theme
        'bg-primary': '#0A0A0A',
        'bg-surface': '#121212',
        'bg-elevated': '#1F1F1F',
        'bg-hover': '#2A2A2A',
        
        'primary': '#22C55E',
        'accent': '#FF8C00',
        'brand-fire': '#22C55E',
        'brand-gold': '#4ADE80',
        'brand-ember': '#16A34A',
        
        'success': '#22C55E',
        'danger': '#DC2626',
        'warning': '#FF8C00',
        'info': '#3B82F6',
        
        'text-primary': '#F2F2F2',
        'text-secondary': '#8C8C8C',
        'text-muted': '#555555',
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
