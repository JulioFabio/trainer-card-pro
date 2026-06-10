---
tags: [documentacao-viva, projeto, status/completo]
status: "ativo"
ultima_atualizacao: 2026-06-04
autor: "Antigravity"
---

# Relatório de Análise: Tratamento de Erros e Experiência do Usuário (UX)

Este documento apresenta uma auditoria detalhada do estado atual de tratamento de erros na Pokédex (Trainer Card Pro), focando em chamadas de API, operações assíncronas, falhas silenciosas, comunicação com o usuário e estratégias de recuperação (como React Error Boundaries).

---

## 🔍 1. Chamadas de API sem Bloco Try-Catch ou Validação de Resposta (`response.ok`)

O principal problema identificado no frontend é que, embora a maioria das chamadas de rede esteja envolvida em blocos `try-catch`, **o `fetch` nativo do JavaScript não lança exceções para códigos de status HTTP de erro (como 400, 404, 500)**. Ele só falha (lançando um erro capturável pelo `catch`) se houver um erro de rede físico (por exemplo, ausência de conexão).

Como resultado, muitas chamadas falham silenciosamente na perspectiva do código JavaScript:

### Casos Críticos:
1. **Auto-Salvar da Ficha do Treinador ([App.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/App.tsx#L304)):**
   ```typescript
   try {
     await fetch('/api/character', {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ ... })
     });
   } catch (e) {
     console.error('Erro no Auto-Save da Ficha', e);
   }
   ```
   * **Problema:** Não há verificação se a resposta foi bem-sucedida (`response.ok`). Se o backend retornar um erro `500 Internal Server Error` (ex: banco SQLite travado) ou `400 Bad Request`, o bloco `catch` é ignorado. O usuário continuará editando a ficha achando que seus dados estão sendo salvos na nuvem, resultando em perda silenciosa de dados ao fechar a aba.

2. **Auto-Salvar do Diário / Notas ([NotesTab.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/NotesTab.tsx#L46)):**
   ```typescript
   if (noteId) {
     await fetch('/api/note', {
       method: 'PUT',
       body: JSON.stringify({ id: noteId, title, content })
     });
   }
   ```
   * **Problema:** Semelhante ao auto-salvar da ficha, a operação `PUT` na nota de jornada não verifica `response.ok`. Se o salvamento falhar no backend, o indicador `isSaving` (que é definido como `false` no bloco `finally`) é desativado na tela, induzindo o usuário a acreditar que a nota foi salva.

3. **Link Cable / Trocas ([TradeModal.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/TradeModal.tsx)):**
   - **`handleRespond`:** Responde a uma troca (`ACCEPTED`/`REJECTED`) usando `fetch('/api/trade', { method: 'PUT', ... })` e imediatamente recarrega as trocas chamando `fetchTrades()`. Não valida se o `fetch` respondeu com sucesso. Se falhar, assume sucesso e recarrega.
   - **`handleCreateTrade`:** Envia um POST para criar uma troca. Se a rota falhar (ex: jogador destino não existe), o código não verifica `res.ok` e exibe `"Proposta enviada!"` na tela do usuário, criando um falso positivo grave de sucesso.

---

## 💤 2. Operações Assíncronas que Podem Falhar Silenciosamente

Operações assíncronas silenciosas ocorrem quando os dados param de atualizar ou são limpos sem que o usuário perceba a falha no fluxo lógico.

### Casos Críticos:
1. **Carregamento Inicial do Personagem ([App.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/App.tsx#L40)):**
   - Se a rota `GET /api/character` retornar um erro `500`, a variável `response.ok` será `false`.
   - O código pula o bloco de inicialização do estado (`setTrainer(...)`), mas entra no bloco `finally` e define `setIsInitializing(false)`.
   - **Consequência:** O dashboard é carregado com valores zerados/padrões da ficha. Se o usuário editar qualquer valor, o auto-save irá disparar em seguida, potencialmente sobrescrevendo a ficha íntegra no banco de dados com uma ficha vazia (Data Overwrite).
2. **Carregamento de Trocas ([TradeModal.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/TradeModal.tsx#L34)):**
   - Se `GET /api/trade` falhar com `500`, a verificação `if (res.ok)` falha silenciosamente, ocultando o erro.
   - O modal encerra o estado `isLoading` e o usuário se depara com a tela vazia: *"Nenhum sinal detectado"* (como se não houvesse trocas), em vez de exibir um erro do sistema de rede.

---

## 📢 3. Falta de Feedback Visual ao Usuário Quando Ocorrem Erros

Na interface atual:
- **Ausência de Indicadores de Sincronização:** Não há indicadores na barra superior da Pokédex informando o estado da sincronização do personagem com o servidor (ex: "Salvo na nuvem", "Salvando...", ou "Sem conexão - Suas alterações podem ser perdidas").
- **Alertas Obsoletos no Crop de Imagem ([ImageCropper.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/ImageCropper.tsx#L70)):**
   - Ao falhar no upload do avatar, a aplicação dispara um `alert('Erro ao enviar imagem.')`. 
   - **Problema:** O uso do `alert()` nativo do navegador trava a thread de renderização, quebra o design moderno da Pokédex e fornece uma experiência antiquada para o usuário.

---

## 🖥️ 4. Erros Registrados no Console sem Tratamento Adequado

Existem múltiplos blocos de captura de exceção cuja única ação é registrar o log no console de desenvolvedor do navegador:
- `console.error('Erro ao carregar dados da API:', error);`
- `console.error('Erro no Auto-Save da Ficha', e);`
- `console.error('Erro ao buscar notas:', e);`
- `console.error('Erro no auto-save da nota:', e);`

### Por que isso é problemático?
- **Invisibilidade para o Usuário Final:** A maioria dos usuários de RPG de mesa jogando na Pokédex não sabe abrir o DevTools (F12) para ver os erros de console.
- **Falta de Políticas de Retry:** Se uma requisição falha por instabilidade momentânea na conexão, a aplicação não tenta reenviar os dados salvos automaticamente.

---

## 🛠️ Sugestão de Soluções e Melhores Práticas

Para solucionar esses gargalos e criar uma experiência de usuário resiliente, propomos as seguintes implementações:

### 1. Criar um Boundary Error do React (ou `error.tsx` no Next.js)

Para evitar que erros de renderização ou quebras de tela críticas quebrem o aplicativo inteiro com uma "tela branca da morte", podemos introduzir um Error Boundary.

Podemos criar uma página de erro global em Next.js no nível da raiz do app:
`app/error.tsx`

```tsx
'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log do erro para a telemetria do servidor ou console
    console.error('Erro capturado no ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-zinc-900 border-4 border-rose-500 rounded-[2rem] p-8 text-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border-2 border-rose-500/30">
          <i className="fa-solid fa-triangle-exclamation text-4xl animate-bounce"></i>
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest text-rose-500 mb-2">
          Falha no Sistema Pokédex
        </h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Ocorreu um erro crítico durante a renderização do painel. Não se preocupe, seus dados do jogo podem ser recuperados.
        </p>
        
        <div className="bg-black/40 p-4 rounded-2xl text-left font-mono text-xs text-rose-400/80 mb-6 overflow-x-auto max-h-32 custom-scrollbar">
          {error.message || 'Erro de renderização desconhecido'}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-700 active:scale-95"
          >
            Recarregar Página
          </button>
          <button
            onClick={() => reset()}
            className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 2. Implementar um Helper de Requisição Segura (`safeFetch`)

Podemos criar uma função de utilidade para o frontend que lide com a lógica de checagem do status HTTP e force o lançamento de erros em respostas não-2xx.

`lib/safeFetch.ts`
```typescript
export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    let errorMessage = `Erro HTTP: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMessage = errorJson.error;
    } catch {}
    throw new Error(errorMessage);
  }
  
  return response.json() as Promise<T>;
}
```

---

### 3. Sistema de Notificações Não-Bloqueantes (Toast System)

Substituir o `alert()` por toasts visuais animados, que aparecem no canto da tela sem interromper a interação do usuário.

Podemos criar um hook de toast simples ou injetar mensagens de erro em um componente de status de salvamento global no cabeçalho do `App.tsx`.

#### Exemplo de Indicador Visual de Sincronização:
Podemos renderizar uma pequena pílula de status no topo do aplicativo indicando o estado de gravação no banco de dados:

```tsx
{/* Status de Sincronização */}
<div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors bg-zinc-800 text-zinc-400">
  {syncState === 'saving' && (
    <>
      <i className="fa-solid fa-spinner animate-spin text-cyan-400" />
      <span>Sincronizando...</span>
    </>
  )}
  {syncState === 'saved' && (
    <>
      <i className="fa-solid fa-cloud-check text-emerald-400" />
      <span>Salvo na Nuvem</span>
    </>
  )}
  {syncState === 'error' && (
    <>
      <i className="fa-solid fa-cloud-exclamation text-rose-400 animate-pulse" />
      <span className="text-rose-400">Erro de Conexão</span>
    </>
  )}
</div>
```

---

### 4. Estratégia de Fallback em LocalStorage (Resiliência Offline)

Se o auto-save da API falhar por problemas de rede, a aplicação não deve perder os dados. Podemos atualizar a estratégia de salvamento para:
1. Tentar salvar via `API`.
2. Se a gravação falhar (ex: `catch` ativado ou `!response.ok`), a aplicação salva uma cópia dos dados localmente no `localStorage` com a chave `character_offline_backup`.
3. Exibe o status `Erro de Conexão (Salvo Localmente)`.
4. Quando a conexão for restabelecida ou ao recarregar, sincroniza o backup pendente com o backend.
