---
tags: [documentacao-viva, projeto, componentes, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-06-15
autor: "Antigravity"
---

# 📝 NotesTab

> Editor e visualizador Markdown integrado para anotações de campanha.
> Arquivo: `components/NotesTab.tsx` — **148 linhas**
> Usado em: [[App#Aba Notas]]

---

## Props

```typescript
interface NotesTabProps {
  characterId: string;                    // ID do personagem para carregar/salvar notas
  themeColor: string;                     // Cor tema para botões ativos e badges
}
```

---

## Estado

| Variável | Tipo | Inicial | Descrição |
|---|---|---|---|
| `isPreview` | `boolean` | `false` | Alterna entre aba de Edição (textarea) e Visualização (Markdown) |
| `showHelp` | `boolean` | `false` | Controla exibição do popup flutuante de Ajuda Markdown |
| `noteId` | `string \| null` | `null` | ID único da nota carregada da API |
| `title` | `string` | `'Diário de Jornada'` | Título padrão da nota |
| `content` | `string` | `''` | Conteúdo da nota em Markdown |
| `isSaving` | `boolean` | `false` | Indica se o salvamento assíncrono para a API está em andamento |
| `saveError` | `string \| null` | `null` | Mensagem de erro caso ocorra falha na requisição |

---

## Integração com a API (Ciclo de Vida)

O componente gerencia seu próprio ciclo de vida de dados:
1. **Busca Inicial**: Ao montar, busca as anotações do personagem via `GET /api/character?id={characterId}`. Se houver notas prévias vinculadas, hidrata o estado local (`noteId`, `title`, `content`).
2. **Auto-Salvar**: Um `useEffect` observa as mudanças no título ou conteúdo e dispara o salvamento automático com debounce de 1s:
   - Se `noteId` já existir: despacha requisição `PUT` para `/api/note`.
   - Se for uma nova nota (sem `noteId`): despacha requisição `POST` para `/api/note`, salvando no banco SQLite relacional e atualizando o `noteId` local com o UUID retornado.

---

## Estrutura do Layout

```
┌────────────────────────────────────────────────────────┐
│ 📝 Notas de Jornada                      [?]  EDIT PREV│
├────────────────────────────────────────────────────────┤
│                                                        │
│   TEXTAREA PARA EDICAO ou RENDERIZACAO DO MARKDOWN    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

- **Header Superior**:
  - Título com ícone `fa-book`.
  - Botão de Ajuda (`[?]`) que abre um popup flutuante com o guia de sintaxe Markdown.
  - Botões alternadores "Editar" e "Visualizar", estilizados com a cor do tema dinamicamente na opção ativa.
- **Área de Conteúdo**:
  - **Modo Edição (`isPreview === false`)**: Um `<textarea>` expansível com tipografia serifada e elegante em formato itálico (`font-serif italic text-xl`), simulando uma folha de caderno de notas física de aventura.
  - **Modo Visualização (`isPreview === true`)**: Renderizador de Markdown que consome plugins externos integrados. Utiliza a classe de tipografia Tailwind `@tailwindcss/typography` (`prose prose-zinc max-w-none`) para estilo automático de títulos, negritos, tabelas e listas.

---

## Guia de Sintaxe Suportado (Cheatsheet Popup)

O popup de ajuda (`showHelp === true`) é renderizado como um cartão flutuante posicionado de forma absoluta (`absolute right-0 top-8 z-50 bg-zinc-900 text-white w-64 p-4 rounded-xl`) exibindo uma tabela rápida de atalhos e sintaxe útil para RPG:

| Recurso | Sintaxe | Exemplo |
|---|---|---|
| **Negrito** | `**texto**` | **Destaque** |
| *Itálico* | `*texto*` | *Ênfase* |
| ~~Riscado~~ | `~~texto~~` | ~~Cancelado~~ |
| Títulos | `# Título 1` / `## Título 2` | Títulos de Seção |
| Listas | `- item` ou `1. item` | Lista de Itens |
| Tarefas | `- [ ] pendente` / `- [x] feito` | Checklist de Missões |
| Links / Fotos | `[texto](url)` / `![desc](url)` | Referências Externas |
| Citações | `> citação` | Falas de NPCs / Rumores |
| Tabelas | Tabelas padrão GFM | Grade de preços de itens |

---

## Dependências e Bibliotecas Usadas

O componente consome bibliotecas externas específicas para garantir uma renderização rápida, segura e flexível:

- **`react-markdown`**: Converte a string pura Markdown em elementos de árvore React estruturados semanticamente de forma segura contra ataques XSS.
- **`remark-gfm`**: Plugin para adicionar suporte a GitHub Flavored Markdown (GFM), habilitando tabelas complexas, checklists de tarefas (`- [ ]`) e links automáticos.

---

## 🏷️ Tags
#componente #editor #markdown #notas #rpg #gfm
