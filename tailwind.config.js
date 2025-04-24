/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mulish', 'sans-serif'],
      },
     
      animation: {
        'bounce-gentle': 'bounce-gentle 3s infinite',
        'text-shimmer': 'text-shimmer 3s ease-in-out infinite',
        'float-circles': 'float-circles 8s infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(5%)' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        'float-circles': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(20px, -20px) rotate(180deg)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fadeInUp': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },

        }, fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },


}// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/pages/*/.{js,ts,jsx,tsx,mdx}",
//     "./src/components/*/.{js,ts,jsx,tsx,mdx}",
//     "./src/app/*/.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       backgroundImage: {
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "gradient-conic":
//           "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
//       },
//     },
//   },
//   plugins: [],
// };