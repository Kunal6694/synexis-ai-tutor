/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Colors
        primary: '#3B4A6B', // Deep Blue-Gray
        accent: {
          DEFAULT: '#FF6B6B', // Lively Coral Red
          secondary: '#7DE2D1', // Soft Muted Teal
        },
        background: {
          DEFAULT: '#F8F9FA', // Very Light Off-White
          card: '#FFFFFF',    // Pure White for Cards
        },
        text: {
          DEFAULT: '#495057', // Dark Text Gray
          secondary: '#868E96', // Medium Text Gray
        },
      },
      fontFamily: {
        // Custom Font Families
        sans: ['Inter', 'sans-serif'], // Default sans-serif, fallback to generic
        heading: ['Poppins', 'sans-serif'], // Specific font for headings
      },
      boxShadow: {
        // Custom Shadows for Depth (You can adjust these later)
        'smooth': '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        'elevate': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}