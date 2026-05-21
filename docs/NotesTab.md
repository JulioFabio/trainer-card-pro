# 📝 NotesTab

> Editor e visualizador Markdown integrado para anotações de campanha.
> Arquivo: `components/NotesTab.tsx` — **148 linhas**
> Usado em: [[App#Aba Notas]]

---

## Props

```typescript
interface NotesTabProps {
  content: string;                        // Conteúdo em texto puro Markdown
  onChange: (value: string) => void;      // Callback executada ao alterar texto
  themeColor: string;                     // Cor tema para botões ativos
}
```

---

## Estado

| Variável | Tipo | Inicial | Descrição |
|---|---|---|---|
| `isPreview` | `boolean` | `false` | Alterna entre aba de Edição (textarea) e Visualização (Markdown) |
| `showHelp` | `boolean` | `false` | Controla exibição do popup flutuante de Ajuda Markdown |

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
