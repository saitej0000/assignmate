/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#f97316", // Vibrant Orange
                "primary-hover": "#ea580c",
                "primary-soft": "#fff7ed", // Very light orange for backgrounds
                "secondary": "#64748b", // Slate 500
                "background": "#fcfaf8", // Warm light gray/beige
                "background-light": "#ffffff",
                "background-dark": "#1e1e1e", // Dark mode background
                "card": "#ffffff",
                "card-light": "#ffffff", // Keep for compatibility
                "card-dark": "#2a221b", // Keep for compatibility
                "border": "#e2e8f0", // Slate 200
                "border-light": "#e7dbcf", // Keep for compatibility
                "border-dark": "#44392f", // Keep for compatibility
                "text-main": "#0f172a", // Slate 900 - High contrast text
                "text-muted": "#64748b", // Slate 500
                "success-bg": "#ecfdf5",
                "success-text": "#059669",
                // Dashboard specific colors (Keep for backward compatibility)
                "secondary-bg": "#fcfaf8",
                "border-subtle": "#efece8",
                "accent-orange": "#FFF0E0",
                "dashboard-muted": "#8c8075",
                "primary-light": "#fbdcb8",
                "text-dark": "#1b140d",
                "border-color": "#f3ede7",
                orange: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316', // Updated Primary Brand Color
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                    950: '#431407',
                },
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                // Precise Landing Page Theme Colors
                "landing-bg": "#121212",
                "landing-card": "#1E1E1E",
                "landing-border": "#323232",
                "landing-text": "#E1E1E1",
                "landing-pill": "#2A2A2A",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Plus Jakarta Sans', 'sans-serif'], // Headers
                body: ['Inter', 'sans-serif'], // Body text
            },
            borderRadius: {
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
                "4xl": "2.5rem",
                "full": "9999px"
            },
            boxShadow: {
                'soft': '0 10px 40px -10px rgba(0,0,0,0.05)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                'card-hover': '0 0 0 1px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.08)',
                'glow': '0 0 20px -5px rgba(249, 115, 22, 0.3)',
                'neon': '0 0 20px rgba(255, 122, 0, 0.4), 0 0 40px rgba(255, 122, 0, 0.2)',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                'scale-in': 'scaleIn 0.2s ease-out forwards',
                'shimmer': 'shimmer 2s linear infinite',
                'spotlight': 'spotlight 2s ease .75s 1 forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    from: { backgroundPosition: '0 0' },
                    to: { backgroundPosition: '-200% 0' },
                },
                spotlight: {
                    '0%': { opacity: 0, transform: 'translate(-72%, -62%) scale(0.5)' },
                    '100%': { opacity: 1, transform: 'translate(-50%,-40%) scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
