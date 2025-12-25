/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#ae6f44',    // Medium Brown (Text, Buttons)
        'brand-secondary': '#ffe4b5',  // Light Cream/Beige (Main Background)
        'brand-light': '#fdf8f0',    // Very Light Cream (Card Backgrounds)
        'brand-accent': '#835834',     // Darker Brown (Accent)
      },
      
      /* FONT CONFIGURATION 
         This is where we link the names from index.css to Tailwind classes.
      */
      fontFamily: {
        // 1. CLASS: font-sans
        // Used for: Body text, paragraphs, buttons (default)
        // Font: ComfyCozies
        sans: ['ComfyCozies', 'Inter', ...defaultTheme.fontFamily.sans],
        
        // 2. CLASS: font-serif
        // Used for: Headings (h1, h2), Titles
        // Font: Cake Nom
        serif: ['CakeNom', 'Georgia', 'serif'],
        
        // 3. CLASS: font-special
        // Used for: Unique text, accents, specific highlighted words
        // Font: CCakep
        special: ['CCakep', 'cursive'],
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
  ],
}