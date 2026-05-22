# 💻 Stack Tecnológica

> Especificação de tecnologias, pacotes, compilação e configurações do ecossistema do [[Trainer Card Pro]].

---

## 🛠️ Núcleo Tecnológico

O aplicativo é desenvolvido como uma aplicação **Next.js (App Router)** moderna, rápida e altamente otimizada, preparada para expansão futura com backend e banco de dados:

1. **React 19 (v19.2.3)**: Biblioteca de UI robusta focada em componentes reutilizáveis, gerenciamento de estado local reativo e hooks avançados (`useMemo`, `useCallback`, `useEffect`).
2. **TypeScript (~v5.8.2)**: Fornece tipagem estática e segura para todo o fluxo de dados do personagem e dos Pokémon (veja [[Types]]).
3. **Tailwind CSS (v3.4.1)**: Framework CSS utilitário para estilização rápida, responsiva e moderna, integrando facilidades como gradientes complexos e efeitos hologramas (veja [[Estilos]]).
4. **Next.js 15 (v15.5.18)**: Framework full-stack React com App Router, Server Components, e infraestrutura para futuro backend. Substitui o Vite como sistema de build e dev server, provendo Hot Module Replacement (HMR), code splitting automático e otimizações de produção.

> [!NOTE]
> **Migração Vite → Next.js (Fase 0.1)**: O projeto foi migrado do Vite (SPA pura) para o Next.js (App Router) em Maio/2026. Nenhuma regra de negócio foi alterada — apenas a infraestrutura de build, roteamento e ponto de entrada. Todos os componentes usam a diretiva `"use client"` pois dependem de `localStorage`, `useState` e `useEffect`.

---

## 📦 Dependências Externas (`package.json`)

As bibliotecas complementares instaladas no projeto resolvem demandas específicas de UI e manipulação de arquivos:

| Pacote | Versão | Função Principal | Referência |
|---|---|---|---|
| **`next`** | `^15.3.0` | Framework React full-stack com App Router e otimizações de build | [[Stack Tecnológica]] |
| **`react-easy-crop`** | `^5.5.6` | Recortador de imagem interativo quadrado em Canvas para fotos e avatares | [[ImageCropper]] |
| **`react-markdown`** | `^10.1.0` | Converte texto puro em elementos React estruturados com segurança | [[NotesTab]] |
| **`remark-gfm`** | `^4.0.1` | Adiciona tabelas, links e checklists ao interpretador Markdown | [[NotesTab]] |
| **`@tailwindcss/typography`** | `^0.5.19` | Plugin utilitário do Tailwind para estilizar automaticamente blocos HTML gerados por Markdown | [[NotesTab]] |

---

## ⚙️ Configurações de Compilação e Build

### 1. Next.js (`next.config.ts`)
- **Porta**: Configurado para rodar localmente na porta `3000` (via script `next dev -p 3000`).
- **reactStrictMode**: Habilitado para detectar problemas durante o desenvolvimento.

### 2. TypeScript (`tsconfig.json`)
- **JSX**: `preserve` — o Next.js gerencia a compilação JSX internamente.
- **Plugin Next**: Ativado para type-checking de rotas e layouts do App Router.
- **Paths**: Mapeamento do caractere `@` para o diretório raiz do projeto (`"@/*": ["./*"]`).

### 3. Tailwind (`tailwind.config.ts`)
- **Varredura**: Configurado para ler arquivos nos diretórios `app/`, `components/`, `src/` e raiz do projeto para purgar CSS não utilizado na build final.
- **Plugins**: Injeta `@tailwindcss/typography` como dependência direta do sistema de compilação.

### 4. App Router — Estrutura de Entrada
- **`app/layout.tsx`**: Layout raiz que define `<html>`, `<head>` (Font Awesome CDN), `<body>` e importa o CSS global.
- **`app/page.tsx`**: Página raiz com diretiva `"use client"` que renderiza o componente `App` principal.
- **`App.tsx`**: Componente-mãe da ficha (permanece na raiz do projeto), marcado como `"use client"`.

---

## 🚀 Como Rodar o Projeto Localmente

Os scripts listados no `package.json` gerenciam o ciclo de vida do projeto usando o gerenciador Node.js:

### Desenvolvimento Local
Para iniciar o servidor dev de recarga rápida:
```bash
npm run dev
```
Acesse no navegador através de: `http://localhost:3000`.

### Build de Produção
Para compilar e otimizar todo o código TypeScript e CSS em arquivos estáticos otimizados sob a pasta `.next/` pronta para deploy:
```bash
npm run build
```

### Preview de Produção
Para servir localmente o build de produção:
```bash
npm run start
```

---

## 🏷️ Tags
#tecnologia #react #nextjs #typescript #tailwind #configuracoes #build
