export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    let errorMessage = `Erro HTTP: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.error) {
        errorMessage = errorJson.error;
      }
    } catch {}
    throw new Error(errorMessage);
  }
  
  return response.json() as Promise<T>;
}
