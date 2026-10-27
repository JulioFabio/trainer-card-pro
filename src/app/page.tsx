import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import App from '@/App';

export const dynamic = 'force-dynamic';

// Guarda no servidor: sem sessão, a pessoa vai para a tela de entrada.
export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return <App />;
}
