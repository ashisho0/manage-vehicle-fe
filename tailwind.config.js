/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        96: "repeat(96, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};
