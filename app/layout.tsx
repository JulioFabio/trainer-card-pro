import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import '../index.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Trainer Card Pro',
  description: 'Ficha digital de Treinador Pokémon para RPG de mesa (PTU). Gerencie atributos, equipe, inventário e notas de campanha.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={`${outfit.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var themeId = localStorage.getItem('trainer_card_pro_theme') || 'rose';
                  var themes = [
                    { id: 'rose', color: '#e11d48' },
                    { id: 'blue', color: '#2563eb' },
                    { id: 'emerald', color: '#059669' },
                    { id: 'amber', color: '#d97706' },
                    { id: 'slate', color: '#334155' }
                  ];
                  var current = themes.find(t => t.id === themeId) || themes[0];
                  var root = document.documentElement;
                  root.style.setProperty('--theme-color', current.color);
                  root.style.setProperty('--scrollbar-color', current.color + '66');
                  root.style.setProperty('--scrollbar-color-hover', current.color + 'aa');
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="bg-slate-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}

