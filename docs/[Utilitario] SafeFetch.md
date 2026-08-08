---
tags: [documentacao-viva, projeto, utilitarios, api, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-08-07
autor: "Antigravity"
---

# 🛡️ SafeFetch (Requisições HTTP Resilientes)

> Utilitário genérico para chamadas HTTP seguras.
> Arquivo: `lib/safeFetch.ts`

---

## Resumo

O `safeFetch` é uma função auxiliar tipada genérica baseada em `fetch` nativo. Ela padroniza a captura de erros HTTP, tenta extrair mensagens amigáveis em JSON retornadas pela API Backend e lança exceções descritivas para tratamento no lado do cliente.

---

## Conexões

- **Rotas de API:** [[\[Rotas\] API da Ficha]], [[\[Rotas\] Upload de Arquivos]], [[\[Sistemas\] Sistema de Trocas]]
- **Consumidores do Frontend:** [[[Componente] App]], [[[Componente] TeamTab]], [[[Componente] PcTab]], [[[Componente] PokemonCreationSheet]], [[[Componente] NotesTab]]
- **Tratamento de Erros:** [[[Interface] ErrorHandler]], [[[DevOps] Analise de Erros]]

---

## Fórmulas e Comportamentos

- **Tipagem Genérica:** `safeFetch<T>(url: string, options?: RequestInit): Promise<T>`
- **Tratamento de Erros HTTP:** 
  1. Verifica se `response.ok` é falso.
  2. Tenta fazer parse do corpo JSON para extrair o campo `errorJson.error`.
  3. Se falhar, fallback para `Erro HTTP: {status} {statusText}`.
- **Parsing Automático:** Se `response.ok` for verdadeiro, automaticamente retorna `response.json() as Promise<T>`.

---

## Estado Atual e Próximos Passos

- [x] Wrapper unificado sobre `fetch` nativo com suporte a Generics TypeScript.
- [x] Extração dinâmica de mensagens de erro JSON do backend.
- [ ] Adicionar suporte a timeout automático configurável via `AbortController`.
- [ ] Integrar retentativas (retry pattern com backoff exponencial) para conexões instáveis.
