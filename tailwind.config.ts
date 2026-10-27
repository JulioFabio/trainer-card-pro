import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

// Tokens do DESIGN.md (seção 3 e front matter). Papéis tipográficos, raios concêntricos,
// sombras duras e a paleta única de tipos Pokémon.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
      },
      fontSize: {
        label:   ['11px', { lineHeight: '14px', letterSpacing: '0.08em' }],
        caption: ['12px', { lineHeight: '16px' }],
        body:    ['14px', { lineHeight: '20px' }],
        lead:    ['16px', { lineHeight: '24px' }],
        heading: ['18px', { lineHeight: '24px' }],
        value:   ['24px', { lineHeight: '28px' }],
        title:   ['36px', { lineHeight: '40px' }],
        display: ['48px', { lineHeight: '48px' }],
      },
      borderRadius: {
        sm: '8px',
        control: '12px',
        inset: '16px',
        card: '24px',
        panel: '32px',
        frame: '40px',
      },
      boxShadow: {
        'hard-sm': '2px 2px 0 rgb(0 0 0 / 0.10)',
        'hard-md': '4px 4px 0 rgb(0 0 0 / 0.12)',
        'hard-lg': '6px 6px 0 rgb(0 0 0 / 0.15)',
        float: '0 8px 30px rgb(0 0 0 / 0.12)',
        glow: '0 0 15px rgb(34 211 238 / 0.8)',
      },
      colors: {
        type: {
          normal: '#919aa2', lutador: '#ce416b', voador: '#89aae3', venenoso: '#b566ce',
          terrestre: '#d97845', pedra: '#c5b78c', inseto: '#91c130', fantasma: '#5269ad',
          aco: '#5a8ea2', fogo: '#fe9d55', agua: '#508fd6', planta: '#63bc5a',
          eletrico: '#f4d23c', psiquico: '#fa7179', gelo: '#73cec0', dragao: '#0b6dc3',
          sombrio: '#5a5465', fada: '#ec8fe6', cristal: '#8e7cc3',
        },
      },
    },
  },
  plugins: [
    typography,
  ],
};

export default config;
