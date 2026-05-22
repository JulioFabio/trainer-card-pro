import type { Metadata } from 'next';
import '../index.css';

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
    <html lang="pt-br">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="bg-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
