// O servidor Next injeta x-forwarded-for (endereço do socket), x-forwarded-host,
// x-forwarded-port e x-forwarded-proto em TODA requisição, e preserva os que já vieram
// de um proxy. Então "tem x-forwarded-*" não distingue o mestre de um visitante: o que
// distingue é o valor. Acesso local direto = Host local, origem em loopback e nenhum
// sinal de proxy/túnel que o servidor não injeta sozinho.
const PROXY_ONLY_HEADERS = ['forwarded', 'x-real-ip', 'cf-connecting-ip', 'via'];

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
const LOOPBACK_ADDRESSES = new Set(['::1', '127.0.0.1', '::ffff:127.0.0.1']);

function hostName(host: string): string {
  const value = host.trim().toLowerCase();
  if (value.startsWith('[')) {
    const end = value.indexOf(']');
    return end === -1 ? value : value.slice(0, end + 1);
  }
  return value.split(':')[0];
}

export function isLocalRequest(headers: Headers): boolean {
  const host = headers.get('host');
  if (!host || !LOCAL_HOSTS.has(hostName(host))) return false;

  if (PROXY_ONLY_HEADERS.some((name) => headers.has(name))) return false;

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor !== null) {
    const addresses = forwardedFor.split(',').map((a) => a.trim().toLowerCase());
    if (!addresses.every((a) => LOOPBACK_ADDRESSES.has(a))) return false;
  }

  const forwardedHost = headers.get('x-forwarded-host');
  if (forwardedHost !== null && forwardedHost.trim().toLowerCase() !== host.trim().toLowerCase()) {
    return false;
  }

  return true;
}
