---
name: pokedex-ui
description: Aplica o DESIGN.md do Trainer Card Pro em qualquer trabalho de UI — criar ou editar componentes .tsx, mexer em className, estilos inline, src/index.css ou tailwind.config. Preserva a estética da Pokédex e corrige proporções (tipografia, espaçamento, alturas, raios, bordas, sombras, cores) para as escalas do documento.
---

# Pokédex UI — aplicar o DESIGN.md

O `DESIGN.md` na raiz é a fonte da verdade visual. A **estética** do app é boa e não muda; as **proporções** antigas estão erradas e devem ser trocadas pelas escalas do documento sempre que um arquivo de UI for tocado.

## Antes de editar

1. Leia `DESIGN.md` inteiro na primeira vez da sessão (tokens no front matter, tabelas de mapeamento nas seções 3 e 5).
2. Confira se os tokens já existem no `tailwind.config.ts` (`fontSize.label`, `borderRadius.card`, `boxShadow['hard-md']`, `colors.type`). Se não existirem, faça a **Configuração inicial** abaixo antes de qualquer outra coisa e mostre o diff.
3. Faça o inventário do arquivo que vai mexer:

```bash
grep -nE 'text-\[[0-9.]+px\]|(p|px|py|pt|pb|pl|pr|m|mx|my|gap|space-[xy])-(0\.5|1\.5|2\.5|3\.5|5|\[[^]]+\])|rounded(-[a-z]+)?-\[[^]]+\]|\b(h|w|min-h)-\[[0-9]+px\]|shadow-\[[^]]+\]|\b(gray|slate)-[0-9]+|tracking-tight(er)?|border-\[[0-9]+px\]' ARQUIVO.tsx
```

Cada linha encontrada é candidata a correção. Valores dentro de `style={{...}}` (fontSize, padding, borderRadius) contam também.

## Ao editar

Use os papéis, nunca números soltos:

| Precisa de… | Use |
|---|---|
| Rótulo de campo, cabeçalho de tabela, badge | `text-label font-extrabold uppercase` |
| Subtexto, descrição curta | `text-caption font-bold` |
| Texto corrido, efeito de ataque, chat | `text-body font-medium` |
| Valor digitado na ficha | `text-body font-extrabold italic` |
| Título de card (h3), nome de perícia/talento | `text-lead font-extrabold` |
| Título de seção (h2) | `text-heading font-black uppercase` |
| Número derivado, nível, pontos | `text-value font-black` |
| Nome do personagem, rótulo vertical | `text-title font-black italic uppercase` |
| Ícone de estado vazio / avatar | `text-display` |

Mapeamento rápido do legado:
- `text-[7px]`…`text-[9px]` e `text-[10px]` em rótulo → `text-label`
- `text-[10px]` em texto, `text-[11px]`, `text-xs` → `text-caption`
- `text-[12px]`…`text-[14px]`, `text-sm` → `text-body`
- `h3` de painel → `text-lead`; `text-xl` em valor → `text-value`; `text-2xl` em nome → `text-title`; `text-4xl/6xl` em ícone → `text-display`
- `rounded-[2.5rem]`/`rounded-[2rem]` → `rounded-panel`; `rounded-3xl` em card → `rounded-card`; `rounded-2xl` interno → `rounded-inset`; `rounded-xl` em controle → `rounded-control`; `rounded`/`rounded-lg` pequeno → `rounded-sm`
- `py-0.5/1.5/2.5/3.5`, `gap-1.5/2.5`, `p-5` → vizinho mais próximo em 4·8·12·16·24·32·48
- `gray-N`, `slate-N` → `zinc-N` (exceto o backdrop `#0f172a`)
- sombras `[Npx_Npx_0px_…]` → `shadow-hard-sm` / `-md` / `-lg` conforme a tabela 3.6

Regras que não se negociam:
- Nada abaixo de 11 px. `font-black` só de 14 px para cima; abaixo disso, `font-extrabold` ou `font-bold`.
- Sem `tracking-tight`/`tracking-tighter` abaixo de 18 px.
- Controles com altura `h-8` (32), `h-10` (40) ou `h-12` (48). Todo alvo clicável ≥ 32×32 — aumente o padding, não o ícone.
- Raio interno = raio externo − padding.
- Borda 2 px padrão; 4 px só em destaque (avatar, nome, Talentos, Evasão, Moves); 3 px só no AttackCard.
- Destaque só via `--theme-color`/`currentTheme.color`; tipos Pokémon só via `colors.type`.
- `hover:scale-105` só em objetos clicáveis "físicos" (avatar, DerivedBox, AttackCard, botão primário) — nunca em abas, chips ou linhas.

**Preserve sempre:** contorno preto, sombra dura sem desfoque, itálico pesado em caixa alta nos dados do personagem, cor do tema nos rótulos, cursores de Pokébola, lente ciano, holograma, scrollbars invisíveis, serifa só no editor de Notas.

Se algo não couber em nenhum token, **não invente um valor**: pare, proponha o token novo e a linha a acrescentar no `DESIGN.md`, e espere aprovação.

## Escopo

- Corrija só os arquivos que a tarefa pede. Não saia migrando o projeto inteiro sem ser pedido.
- Mudança visual apenas: não altere lógica, estado, handlers nem tipos junto com a migração.
- Para migrar o projeto todo, siga a ordem da seção 9 do `DESIGN.md`, um passo por vez, cada um em commit próprio.

## Ao terminar

1. Rode de novo o grep do inventário no arquivo. O resultado deve ser vazio, exceto as exceções documentadas (`#0f172a`, `border-[3px]` no AttackCard, `pl-[80px]` e `w-[444px]` no PokéPapo, `border-[12px]` no console).
2. Rode `npx tsc --noEmit` e os testes existentes (`npm test`).
3. Responda com um resumo curto: arquivo, quantos valores fora da escala havia e quantos restam, e qualquer exceção ou token novo proposto. Sem repetir o diff inteiro.

## Configuração inicial (uma vez)

Se os tokens não existirem, adicione em `tailwind.config.ts` → `theme.extend`:

```ts
fontSize: {
  label:   ['11px', { lineHeight: '14px', letterSpacing: '0.08em' }],
  caption: ['12px', { lineHeight: '16px' }],
  body:    ['14px', { lineHeight: '20px' }],
  lead:    ['16px', { lineHeight: '24px' }],
  heading: ['18px', { lineHeight: '24px' }],
  value:   ['24px', { lineHeight: '28px' }],
  title:   ['36px', { lineHeight: '40px' }],
  display: ['48px', { lineHeight: '48px' }],
},
borderRadius: {
  sm: '8px', control: '12px', inset: '16px', card: '24px', panel: '32px', frame: '40px',
},
boxShadow: {
  'hard-sm': '2px 2px 0 rgb(0 0 0 / 0.10)',
  'hard-md': '4px 4px 0 rgb(0 0 0 / 0.12)',
  'hard-lg': '6px 6px 0 rgb(0 0 0 / 0.15)',
  float: '0 8px 30px rgb(0 0 0 / 0.12)',
  glow: '0 0 15px rgb(34 211 238 / 0.8)',
},
colors: {
  type: {
    normal: '#919aa2', lutador: '#ce416b', voador: '#89aae3', venenoso: '#b566ce',
    terrestre: '#d97845', pedra: '#c5b78c', inseto: '#91c130', fantasma: '#5269ad',
    aco: '#5a8ea2', fogo: '#fe9d55', agua: '#508fd6', planta: '#63bc5a',
    eletrico: '#f4d23c', psiquico: '#fa7179', gelo: '#73cec0', dragao: '#0b6dc3',
    sombrio: '#5a5465', fada: '#ec8fe6', cristal: '#8e7cc3',
  },
},
```

A cor do texto sobre cada tipo está em `colors.types.<tipo>.fg` no `DESIGN.md` (branco só para lutador, fantasma, dragão e sombrio; o resto usa `zinc-900`). Para o `AttackCard`, troque o mapa `TYPE_BG_CLASSES` por uma leitura dessa tabela, para que um tipo tenha a mesma cor em todo o app.
