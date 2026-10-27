// Cabeçalhos acrescentados por proxies e túneis (localtunnel, cloudflared, nginx).
// O túnel encaminha para localhost:3000, então o endereço de origem não distingue o
// mestre de um visitante remoto; o que distingue é o Host e a ausência desses sinais.
const PROXY_HEADERS = [
  'x-forwarded-for',
  'x-forwarded-host',
  'forwarded',
  'x-real-ip',
  'cf-connecting-ip',
  'via',
];

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

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
  return PROXY_HEADERS.every((name) => !headers.has(name));
}
