---
tags: [documentacao-viva, projeto, componentes, erro, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-08-07
autor: "Antigravity"
---

# ⚠️ ErrorHandler (Tratamento Global de Erros)

> Componente de barreira de erros do React/Next.js App Router.
> Arquivo: `app/error.tsx`

---

## Resumo

O `ErrorHandler` é o **Error Boundary** raiz da aplicação no App Router do Next.js. Ele intercepta qualquer exceção não tratada lançada durante a renderização no lado do cliente ou servidor, apresentando uma interface temática estilo Pokédex sem derrubar a aplicação inteira.

---

## Conexões

- **Componente-Mãe:** [[[Arquitetura] Stack Tecnologica]] (`app/layout.tsx`)
- **Visual & Estilos:** [[[Interface] Estilos e Temas]] (`index.css`)
- **Sistema de Telemetria:** [[[DevOps] Telemetria e Observabilidade]] (`lib/telemetry.ts`)

---

## Fórmulas e Comportamentos

- **Estratégia de Recuperação:** Oferece duas opções ao usuário:
  1. `Recarregar Página`: `window.location.reload()` para reordenar todo o estado da memória.
  2. `Tentar Novamente`: Invoca a função `reset()` do Next.js para tentar re-renderizar a árvore de componentes sem recarregar a página.
- **Exibição do Erro:** Extrai a mensagem de erro (`error.message`) e a exibe em um contêiner monospaçado estilizado.

---

## Estado Atual e Próximos Passos

- [x] Interceptação global de exceções no App Router.
- [x] Layout responsivo com tema escuro de emergência e animações FontAwesome.
- [x] Opções de reload completo e reset suave da árvore React.
- [ ] Integrar envio automático do digest de erro para a API de [[[DevOps] Telemetria e Observabilidade]].
