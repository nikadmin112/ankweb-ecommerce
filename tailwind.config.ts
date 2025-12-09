import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx,mdx}', './src/components/**/*.{ts,tsx}', './src/app/**/*.{js,jsx}', './src/components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif']
      },
      colors: {
        ink: '#0f1021',
        lilac: '#a855f7',
        orchid: '#d946ef',
        midnight: '#0b0b1d'
      },
      backgroundImage: {
        radiant: 'radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.25), transparent 25%), radial-gradient(circle at 80% 0%, rgba(217, 70, 239, 0.2), transparent 30%), linear-gradient(135deg, #1a0b2e, #0f1021)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
