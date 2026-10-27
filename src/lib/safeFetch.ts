export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit,
  retries = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        // Se for erro transitório de proxy/tunnel (502 Bad Gateway, 503, 504), tenta novamente
        const isTransientErr = [502, 503, 504].includes(response.status);
        if (isTransientErr && attempt < retries) {
          await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
          continue;
        }

        let errorMessage = `Erro HTTP: ${response.status} ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson && errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch {}
        throw new Error(errorMessage);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      lastError = err;
      // Trata erros de conexão de rede ou exceções de fetch transitórias
      if (attempt < retries && (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('HTTP: 502'))) {
        await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Falha de conexão com o servidor.');
}

