/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MindPath brand palette — muted greens, warm whites
        sage: {
          50:  '#f4f7f4',
          100: '#e6ede6',
          200: '#ccdccc',
          300: '#a4c0a4',
          400: '#739e73',
          500: '#528052',
          600: '#3f6640',
          700: '#345234',
          800: '#2b4230',
          900: '#243729',
        },
        warm: {
          50:  '#faf9f7',
          100: '#f4f2ee',
          200: '#e8e4dc',
          300: '#d5cfC3',
          400: '#b8af9e',
          500: '#9e9282',
          600: '#857768',
          700: '#6e6156',
          800: '#5a5048',
          900: '#4b433c',
        },
        mint: {
          50:  '#f0faf4',
          100: '#dcf5e7',
          200: '#bbe9d1',
          300: '#8ed8b3',
          400: '#5cbf8d',
          500: '#3aa471',
          600: '#28845a',
          700: '#1f6947',
          800: '#1a543a',
          900: '#174530',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'sidebar': '1px 0 0 0 #e6ede6',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
}
