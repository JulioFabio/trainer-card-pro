---
tags: [documentacao-viva, projeto, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-05-23
autor: "Antigravity"
---

# 💻 Stack Tecnológica

> Especificação de tecnologias, pacotes, compilação e configurações do ecossistema do [[Trainer Card Pro]].

---

## 🛠️ Núcleo Tecnológico

O aplicativo é desenvolvido como uma aplicação **Next.js (App Router)** moderna, rápida e altamente otimizada:

1. **React 19 (v19.2.3)**: Biblioteca de UI robusta focada em componentes reutilizáveis e hooks avançados (`useMemo`, `useCallback`, `useEffect`).
2. **TypeScript (~v5.8.2)**: Fornece tipagem estática e segura para todo o fluxo de dados (veja [[Types]]).
3. **Tailwind CSS (v3.4.1)**: Framework CSS utilitário para estilização rápida, responsiva e moderna (veja [[Estilos]]).
4. **Next.js 15 (v15.5.18)**: Framework full-stack React com App Router, Server Components e API Routes.
5. **Prisma ORM (v7.x)**: Mecanismo de mapeamento objeto-relacional para acesso tipado e seguro ao banco de dados SQLite local (veja [[[Arquitetura] Banco de Dados]]).

---

## 📦 Dependências Externas (`package.json`)

As bibliotecas complementares instaladas no projeto resolvem demandas específicas de UI, banco de dados e manipulação de arquivos:

| Pacote | Versão | Função Principal | Referência |
|---|---|---|---|
| **`next`** | `^15.3.0` | Framework React full-stack com App Router e otimizações de build | [[Stack Tecnológica]] |
| **`better-sqlite3`** | `^11.8.0` | Driver SQLite nativo de alta performance escrito em C++ para Node.js | [[[Arquitetura] Banco de Dados]] |
| **`@prisma/client`** | `^7.x` | Cliente gerado tipado do Prisma para execução de queries | [[[Arquitetura] Banco de Dados]] |
| **`@prisma/adapter-better-sqlite3`** | `^7.x` | Driver Adapter oficial para conectar o Prisma 7 a instâncias better-sqlite3 | [[[Arquitetura] Banco de Dados]] |
| **`react-easy-crop`** | `^5.5.6` | Recortador de imagem interativo quadrado em Canvas para fotos e avatares | [[ImageCropper]] |
| **`react-markdown`** | `^10.1.0` | Converte texto puro em elementos React estruturados com segurança | [[NotesTab]] |
| **`remark-gfm`** | `^4.0.1` | Adiciona tabelas, links e checklists ao interpretador Markdown | [[NotesTab]] |
| **`@tailwindcss/typography`** | `^0.5.19` | Plugin utilitário do Tailwind para estilizar blocos HTML Markdown | [[NotesTab]] |

---

## ⚙️ Configurações de Compilação e Build

### 1. Next.js (`next.config.ts`)
- **Porta**: Configurado para rodar localmente na porta `3000` (via script `next dev`).
- **reactStrictMode**: Habilitado para detectar problemas em tempo de desenvolvimento.
- **serverExternalPackages**: Configurado com `["better-sqlite3"]` para impedir que o Next.js tente empacotar o binário compilado nativo (C++) do driver SQLite no bundle do servidor.
- **devIndicators**: Desativado (`devIndicators: false`) para contornar um bug intermitente e conhecido no Segment Explorer da compilação de desenvolvimento do Next.js 15 App Router no sistema operacional Windows.

### 2. TypeScript (`tsconfig.json`)
- **JSX**: `preserve` — o Next.js gerencia a compilação JSX internamente.
- **Paths**: Mapeamento do caractere `@` para o diretório raiz do projeto (`"@/*": ["./*"]`).

### 3. Tailwind (`tailwind.config.ts`)
- **Varredura**: Configurado para ler arquivos nos diretórios `app/`, `components/`, `src/` e raiz do projeto.
- **Plugins**: Injeta `@tailwindcss/typography`.

---

## 🚀 Como Rodar o Projeto Localmente

### Desenvolvimento Local
Para iniciar o servidor dev de recarga rápida:
```bash
npm run dev
```
Acesse no navegador através de: `http://localhost:3000`.

### Gerenciamento de Banco de Dados (Prisma)
- **Sincronizar Esquema**: `npx prisma db push`
- **Interface Visual do DB**: `npx prisma studio`
- **Gerar Cliente Prisma**: `npx prisma generate`

---

## 🏷️ Tags
#tecnologia #react #nextjs #typescript #tailwind #configuracoes #build #prisma #sqlite
