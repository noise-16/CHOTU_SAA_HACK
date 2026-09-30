/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          navy: '#0F172A',
          navyLight: '#1E293B',
          textMuted: '#64748B',
          textPrimary: '#0F172A',
          sage: '#2D6A4F',
          sageBg: '#E2ECE9',
          sageLight: '#F0FDF4',
        },
        esi: {
          critical: '#DC2626', // Level 1 / 80-100
          criticalBg: '#FEF2F2',
          criticalBorder: '#FCA5A5',
          high: '#EA580C',     // Level 2 / 60-79
          highBg: '#FFF7ED',
          highBorder: '#FDBA74',
          moderate: '#CA8A04', // Level 3 / 40-59
          moderateBg: '#FEFCE8',
          moderateBorder: '#FDE047',
          routine: '#16A34A',  // Level 4 / 20-39
          routineBg: '#F0FDF4',
          routineBorder: '#86EFAC',
          stable: '#475569',   // Level 5 / 1-19
          stableBg: '#F1F5F9',
          stableBorder: '#CBD5E1',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
