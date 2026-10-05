/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ir: {
          bg: "#071426",
          panel: "#0B1F3A",
          card: "#0B1F3A",
          border: "#12345A",
          red: "#1D4ED8",
          redGlow: "#1D4ED8",
          green: "#CBD5E1",
          amber: "#12345A",
          blue: "#1D4ED8",
          gold: "#FFFFFF",
          muted: "#CBD5E1",
          text: "#FFFFFF"
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(29, 78, 216, 0.4), 0 0 10px rgba(29, 78, 216, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(29, 78, 216, 0.8), 0 0 30px rgba(29, 78, 216, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
