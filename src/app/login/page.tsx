import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isLocalRequest } from '@/lib/localRequest';
import { getSessionName, listLoginProfiles } from '@/lib/profiles';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sair?: string }>;
}) {
  const session = await auth();
  if (session?.user?.id) redirect('/');

  const { sair } = await searchParams;
  const isLocal = isLocalRequest(await headers());
  const [sessionName, profiles] = await Promise.all([getSessionName(), listLoginProfiles()]);

  // O acesso local do Mestre entra sozinho, exceto logo após um logout explícito.
  return (
    <LoginForm
      sessionName={sessionName}
      profiles={profiles}
      isLocal={isLocal}
      autoEnter={isLocal && !sair}
    />
  );
}
