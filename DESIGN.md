---
name: Trainer Card Pro
version: 2.0.0
supersedes: .stitch/DESIGN.md (v1.0.0)
brand:
  name: Trainer Card Pro
  tagline: Ficha de personagem digital para o sistema de RPG Pokémon (PTA 2.0 / PTU)
  aesthetic: Pokédex eletrônica retrofuturista, flat de alto contraste com contorno preto de mangá
colors:
  themes:            # carcaça da Pokédex, trocável pelo usuário (constants.ts → POKEDEX_THEMES)
    rose:    { main: "#e11d48", dark: "#9f1239", light: "#fff1f2" }   # padrão
    blue:    { main: "#2563eb", dark: "#1e40af", light: "#eff6ff" }
    emerald: { main: "#059669", dark: "#065f46", light: "#ecfdf5" }
    amber:   { main: "#d97706", dark: "#92400e", light: "#fffbeb" }
    slate:   { main: "#334155", dark: "#0f172a", light: "#f8fafc" }
  types:             # fonte única da verdade para tipos Pokémon (fundo / texto)
    normal:    { bg: "#919aa2", fg: "#18181b" }
    lutador:   { bg: "#ce416b", fg: "#ffffff" }
    voador:    { bg: "#89aae3", fg: "#18181b" }
    venenoso:  { bg: "#b566ce", fg: "#18181b" }
    terrestre: { bg: "#d97845", fg: "#18181b" }
    pedra:     { bg: "#c5b78c", fg: "#18181b" }
    inseto:    { bg: "#91c130", fg: "#18181b" }
    fantasma:  { bg: "#5269ad", fg: "#ffffff" }
    aco:       { bg: "#5a8ea2", fg: "#18181b" }
    fogo:      { bg: "#fe9d55", fg: "#18181b" }
    agua:      { bg: "#508fd6", fg: "#18181b" }
    planta:    { bg: "#63bc5a", fg: "#18181b" }
    eletrico:  { bg: "#f4d23c", fg: "#18181b" }
    psiquico:  { bg: "#fa7179", fg: "#18181b" }
    gelo:      { bg: "#73cec0", fg: "#18181b" }
    dragao:    { bg: "#0b6dc3", fg: "#ffffff" }
    sombrio:   { bg: "#5a5465", fg: "#ffffff" }
    fada:      { bg: "#ec8fe6", fg: "#18181b" }
    cristal:   { bg: "#8e7cc3", fg: "#18181b" }
  neutrals:          # família única: zinc
    backdrop: "#0f172a"   # fundo atrás do console (slate-900), única exceção à família zinc
    surface:  "#ffffff"
    sunken:   "#fafafa"   # zinc-50
    muted:    "#f4f4f5"   # zinc-100
    line:     "#e4e4e7"   # zinc-200
    ink:      "#000000"   # contorno
    text:     "#18181b"   # zinc-900
    text-2:   "#52525b"   # zinc-600
    text-3:   "#a1a1aa"   # zinc-400 (só placeholders e desabilitados)
  status:
    success: "#34d399"    # emerald-400 (sync ok)
    warning: "#fbbf24"    # amber-400 (salvando)
    danger:  "#f43f5e"    # rose-500 (erro, limite excedido)
    scanner: "#22d3ee"    # cyan-400 (lente da Pokédex)
typography:
  family:
    sans:  "Outfit (next/font, var(--font-outfit))"
    serif: "ui-serif, Georgia, serif — só no editor da aba Notas"
  scale:             # escala clássica (Bringhurst): 11 · 12 · 14 · 16 · 18 · 24 · 36 · 48
    label:   { size: 11px, line: 14px, weight: 800, case: upper, tracking: 0.08em }
    caption: { size: 12px, line: 16px, weight: 700 }
    body:    { size: 14px, line: 20px, weight: 500 }
    input:   { size: 14px, line: 20px, weight: 800, style: italic }
    lead:    { size: 16px, line: 24px, weight: 800 }
    heading: { size: 18px, line: 24px, weight: 900, case: upper }
    value:   { size: 24px, line: 28px, weight: 900 }
    title:   { size: 36px, line: 40px, weight: 900, style: italic, case: upper }
    display: { size: 48px, line: 48px, weight: 900 }
  minimum: 11px
spacing:
  base: 4px
  scale: [4, 8, 12, 16, 24, 32, 48]
  gutter: { mobile: 16px, desktop: 24px }
  card_padding: { compact: 16px, panel: 24px }
  section_gap: 24px
  stack_gap: { tight: 8px, default: 16px }
sizing:
  control: { sm: 32px, md: 40px, lg: 48px }
  icon_button: { sm: 32px, md: 36px }
  hit_area_min: 32px
  icon: { sm: 12px, md: 16px, lg: 20px }
radius:              # o raio cresce com o tamanho do contêiner
  sm:      8px       # rank buttons, chips internos
  control: 12px      # inputs, botões, campos rotulados
  inset:   16px      # caixas dentro de cards (DerivedBox, área de adicionar talento)
  card:    24px      # cards de seção
  panel:   32px      # painéis principais, modais
  frame:   40px      # console da Pokédex e gaveta do PokéPapo
  pill:    9999px    # abas, badges, pílulas do header
  print:   0px       # AttackCard (imita carta impressa)
border:
  hairline: 1px      # divisórias internas, sempre translúcidas ou zinc-200
  regular:  2px solid #000   # componentes padrão
  strong:   4px solid #000   # painéis de destaque (Talentos, Evasão, avatar)
  print:    3px solid #000   # exclusivo do AttackCard
  frame:    12px solid rgb(0 0 0 / .2)   # moldura do console
shadow:
  hard-sm:  "2px 2px 0 rgb(0 0 0 / .10)"
  hard-md:  "4px 4px 0 rgb(0 0 0 / .12)"
  hard-lg:  "6px 6px 0 rgb(0 0 0 / .15)"
  float:    "0 8px 30px rgb(0 0 0 / .12)"
  overlay:  "0 25px 50px -12px rgb(0 0 0 / .25)"   # shadow-2xl, modais e console
  inset:    "inset 0 2px 4px rgb(0 0 0 / .05)"
  glow:     "0 0 15px rgb(34 211 238 / .8)"         # lente ciano
motion:
  fast: 150ms cubic-bezier(.4,0,.2,1)
  theme: 500ms        # troca de cor da carcaça
  drawer: 500ms cubic-bezier(.2,.8,.2,1)
  hologram: { glow: 3s, scan: 4s, flicker: 8s }
---

# Design do Trainer Card Pro

Este documento define o visual do Trainer Card Pro. A **estética** foi extraída do código e deve ser preservada. As **proporções** foram auditadas e reescritas sobre escalas fixas. Qualquer tela nova ou refeita usa só os tokens do cabeçalho acima.

Esta versão substitui o `.stitch/DESIGN.md` (v1.0.0). Ela também corrige quatro valores que lá estavam errados em relação ao código:

- os tons `dark` dos temas (o código usa `-800`/`-900`, não `-700`);
- a ausência de qualquer escala de tamanho, espaço ou raio;
- as duas paletas de tipo Pokémon, hoje divergentes entre si;
- a mistura de três famílias de cinza.

---

## 1. Identidade (preservar)

O app é um **dispositivo físico**: uma Pokédex com carcaça colorida, lente ciano pulsando, moldura grossa e uma gaveta lateral (PokéPapo) que desliza por trás do console. Dentro da carcaça, a tela é branca e organizada como uma ficha de RPG impressa: contorno preto de quadrinho, sombra deslocada sem desfoque, rótulos em caixa alta e valores em itálico pesado.

O que torna isso bom, e não pode se perder:

1. **A cor do tema contamina tudo o que é identidade do personagem.** Rótulos de campo, nível, barra de HP, aba ativa e ícones de seção usam `--theme-color`. O resto é neutro.
2. **Contorno preto + sombra dura** é o que separa um "objeto" (campo, card, avatar) do fundo. Sombras suaves ficam reservadas para coisas que flutuam (modal, gaveta, tooltip).
3. **Itálico preto em caixa alta** é a voz dos dados do personagem (nome, classes, talentos, valores). Texto corrido e descrições ficam em peso normal.
4. **Detalhes de hardware**: cursores de Pokébola, lente ciano, holograma nos detalhes de Pokémon, scrollbars invisíveis.

---

## 2. Auditoria de proporções

A contagem foi feita sobre `App.tsx`, `components/*.tsx` e `app/admin/page.tsx`.

| # | Problema | Evidência no código | Efeito |
|---|---|---|---|
| 1 | **Base tipográfica esmagada** | 118 usos entre 7 e 11 px (`text-[7px]` ×11, `[8px]` ×17, `[9px]` ×27, `[10px]` ×55, `[11px]` ×8) | Rótulos ilegíveis; tudo parece "miúdo" |
| 2 | **Salto sem degraus** | Depois de 14 px, pula para 18, 20, 24, 36 e 60 px | Valores gritam, rótulos sussurram (DerivedBox: rótulo 8 px × valor 20 px = 2,5×) |
| 3 | **Hierarquia invertida** | `h3` de painel = 10 px; `h2` de seção = 18 px; valores = 20 px | Título de card menor que o dado dentro dele |
| 4 | **Peso máximo em tudo** | `font-black` ×159 contra `font-bold` ×41 | Em 8–10 px o 900 empasta e vira mancha |
| 5 | **Tracking brigando com tamanho** | `tracking-tighter` em rótulos de 8–9 px | Letras se encostam justamente onde mais precisam de ar |
| 6 | **Alturas de controle aleatórias** | Abas ~26 px, inputs `py-1` ~28 px, InfoField 40 px, botão `h-[42px]`, rank 24 px, fechar aba 16 px | Linhas desalinhadas; alvos de clique de 16 px |
| 7 | **Nove raios diferentes** | 4, 8, 12, 16, 24, 32, 36 e 40 px, além de 0 | Painel interno (40 px) mais redondo que o console que o contém (36 px) |
| 8 | **Raio interno ≥ externo** | Card `rounded-[2.5rem]` + `p-3` contendo campos `rounded-xl` | Cantos não concêntricos, aspecto "colado" |
| 9 | **Espaçamento fora da grade** | `p-[5px]`, `p-[20px]`, `py-0.5/1.5/2.5/3.5`, `gap-1.5/2.5`, `p-5` | Ritmo vertical irregular |
| 10 | **Padding de card sem critério** | Cards equivalentes com `p-3`, `p-4`, `p-5` e `p-6`; tabela da Mochila `px-8 py-5` com texto de 10–12 px | Cards irmãos com respiros diferentes |
| 11 | **Gaveta assimétrica** | PokéPapo: `pt/pb/pr-4` (16 px) e `pl-[72px]` sobre 64 px de sobreposição, ou seja, 8 px úteis à esquerda | Conteúdo encosta na carcaça de um lado só |
| 12 | **Três famílias de cinza** | `zinc` (maioria), `gray` (~40 usos) e `slate` (~15) | Cinzas levemente diferentes lado a lado |
| 13 | **Bordas sem hierarquia** | 1, 2, 3, 4, 6, 8 e 12 px | Não fica claro o que é destaque |
| 14 | **Sombras duras inconsistentes** | Deslocamentos 1/2/4/6/8 px com opacidade de 0,02 a 0,15 | 0,02 e 0,05 são invisíveis; o efeito some de forma aleatória |
| 15 | **Duas paletas de tipo** | `AttackCard` usa classes Tailwind (`bg-orange-500` para Fogo); `PokemonCreationSheet` usa hex (`#fe9d55`) | O mesmo tipo aparece com duas cores |

---

## 3. Escalas corrigidas

### 3.1 Tipografia

A escala segue a progressão clássica de *The Elements of Typographic Style*: **11 · 12 · 14 · 16 · 18 · 24 · 36 · 48**. Nada fica abaixo de 11 px.

| Papel | Tamanho / linha | Peso | Uso | Classe Tailwind |
|---|---|---|---|---|
| `label` | 11 / 14 | 800, caixa alta, `tracking-[0.08em]` | Rótulos de campo, cabeçalhos de tabela, badges | `text-[11px] leading-[14px] font-extrabold uppercase tracking-[0.08em]` |
| `caption` | 12 / 16 | 700 | Subtextos, atributo de perícia, descrição de item | `text-xs font-bold` |
| `body` | 14 / 20 | 500 | Efeitos de ataque, descrições, chat | `text-sm font-medium` |
| `input` | 14 / 20 | 800 itálico | Campos da ficha | `text-sm font-extrabold italic` |
| `lead` | 16 / 24 | 800 | Título de card (`h3`), nome de perícia ou talento | `text-base font-extrabold` |
| `heading` | 18 / 24 | 900, caixa alta | Título de seção (`h2`) | `text-lg font-black uppercase` |
| `value` | 24 / 28 | 900 | Números derivados, nível, pontos | `text-2xl font-black` |
| `title` | 36 / 40 | 900 itálico, caixa alta | Nome do personagem, rótulos verticais (EVASÃO, MOVES) | `text-4xl font-black italic uppercase` |
| `display` | 48 / 48 | 900 | Ícones de estado vazio e de avatar | `text-5xl` |

**Regras**

- O peso 900 (`font-black`) só vale de 14 px para cima. Entre 11 e 12 px use 800 ou 700.
- `tracking-tighter` e `tracking-tight` são proibidos abaixo de 18 px. Rótulos em caixa alta usam `0.08em`; `tracking-widest` (0.1em) só em `label` isolado.
- A razão entre rótulo e valor fica entre 1,5× e 2,2× (exemplos: `label` 11 → `value` 24; `caption` 12 → `lead` 16).
- O título de um card (`lead`, 16 px) é sempre menor que o título de seção (`heading`, 18 px) e maior que qualquer rótulo dentro do card.

**Mapeamento do atual para o novo**

| Atual | Novo |
|---|---|
| `text-[7px]`, `[8px]`, `[9px]` | `label` (11) |
| `text-[10px]` em rótulo | `label` (11) |
| `text-[10px]` em texto, `[11px]`, `text-xs` | `caption` (12) |
| `[12px]`, `[13px]`, `[14px]`, `text-sm` | `body` (14) |
| `h3` de painel (10 px) | `lead` (16) |
| `text-lg` (h2) | `heading` (18), sem mudança |
| `text-xl` em valores | `value` (24) |
| `text-2xl` no nome / rótulo vertical | `title` (36) |
| `text-4xl` / `text-6xl` em ícones | `display` (48) |

### 3.2 Espaçamento (base 4)

Valores permitidos: **4 · 8 · 12 · 16 · 24 · 32 · 48** (`1 · 2 · 3 · 4 · 6 · 8 · 12` no Tailwind). Ficam proibidos `0.5`, `1.5`, `2.5`, `3.5`, `5` e valores entre colchetes.

| Contexto | Valor |
|---|---|
| Gutter da janela | 16 px no mobile, 24 px a partir de `sm` (substitui `p-[20px]`) |
| Padding da área de conteúdo | 24 px (`p-6`); abas de Pokémon usam 8 px (substitui `p-[5px]`) |
| Padding de card de seção | 16 px (`p-4`) |
| Padding de painel principal ou modal | 24 px (`p-6`) |
| Gap entre colunas e seções | 24 px (`gap-6`), unificando `gap-8` e `gap-6` |
| Gap entre campos empilhados | 8 px (`gap-2`) |
| Gap entre ícone e texto | 8 px (`gap-2`) |
| Célula de tabela | `px-4 py-3` (substitui `px-8 py-5`) |
| Header do console | `px-6 py-4` |

### 3.3 Controles e alvos de clique

| Token | Altura | Componentes |
|---|---|---|
| `control-sm` | 32 px | Abas, pílulas do header, chips de talento, rank (T/E), botões de rolagem |
| `control-md` | 40 px | Inputs, InfoField, campo de classe, botão Adicionar, input do chat |
| `control-lg` | 48 px | CTA de tela de erro, botões de modal |
| `icon-button` | 32 px (sm) / 36 px (md) | Fechar aba, remover talento (hoje 16 px) / sync e trocas no header |

Todo alvo clicável tem no mínimo 32 × 32 px. O ícone pode continuar pequeno: aumente a área com padding, não o glifo.

### 3.4 Raios (concêntricos)

O raio cresce com o contêiner. A regra é **raio interno = raio externo − padding**.

| Token | Valor | Onde |
|---|---|---|
| `frame` | 40 px | Console e gaveta do PokéPapo (sobe de 36 px para ficar acima dos painéis) |
| `panel` | 32 px | Painéis principais (Talentos, Evasão, Mochila, PC) e modais (substitui 2.5rem) |
| `card` | 24 px | Cards de seção (Biografia, Classes, Movimento, Atributos) |
| `inset` | 16 px | Caixas dentro de cards (DerivedBox, área de novo talento, HP bar) |
| `control` | 12 px | Inputs, botões, campos rotulados |
| `sm` | 8 px | Rank buttons, contadores, grupos segmentados |
| `pill` | 9999 px | Abas, badges, pílulas do header, swatches de tema |
| `print` | 0 | AttackCard |

Exemplo: em um `panel` (32 px) com `p-4` (16 px), os filhos usam `inset` (16 px).

### 3.5 Bordas

| Token | Uso |
|---|---|
| `hairline` 1 px | Divisórias internas (`border-zinc-200` ou `border-white/10`) |
| `regular` 2 px preto | Todo campo, card e controle com contorno |
| `strong` 4 px preto | Só objetos de destaque: avatar, nome do personagem, painéis Talentos, Evasão e Moves |
| `print` 3 px preto | Só o AttackCard |
| `frame` 12 px `black/20` | Moldura do console |

A borda da gaveta (hoje 6 px) passa a ser 12 px para casar com o console. Divisórias pontilhadas (`border-dotted`) continuam permitidas entre rótulo e valor dos campos rotulados.

### 3.6 Sombras

| Token | Valor | Uso |
|---|---|---|
| `hard-sm` | `2px 2px 0 rgb(0 0 0/.10)` | Campos e DerivedBox |
| `hard-md` | `4px 4px 0 rgb(0 0 0/.12)` | Cards de seção, nome do personagem |
| `hard-lg` | `6px 6px 0 rgb(0 0 0/.15)` | Painéis `strong` e avatar |
| `float` | `0 8px 30px rgb(0 0 0/.12)` | Tela interna do PokéPapo, tooltips |
| `overlay` | `shadow-2xl` | Console, modais |

As sombras de opacidade 0,02 e 0,05 saem. Se a sombra não aparece, ela não existe.

---

## 4. Layout

```
┌─ backdrop #0f172a ─────────────────────────────────────────────┐
│ gutter 16/24                                                   │
│ ┌─ console (frame 40, borda 12) ───────────────────┐┌─gaveta─┐ │
│ │ header: lente · temas │ dias · dex │ sync · troca││PokéPapo│ │
│ ├──────────────────────────────────────────────────┤│ 380 px │ │
│ │ abas (pill, control-sm, gap-2)                   ││ visível│ │
│ ├──────────────────────────────────────────────────┤│        │ │
│ │ conteúdo p-6                                     ││        │ │
│ │ ┌─ 8 col ──────────────────┐ ┌─ 4 col ─────────┐ ││        │ │
│ │ │ avatar + identidade      │ │ Talentos        │ ││        │ │
│ │ │ ┌─ card ─┐ ┌─ card ─┐   │ │ (panel, strong) │ ││        │ │
│ │ └──────────────────────────┘ └─────────────────┘ ││        │ │
│ └──────────────────────────────────────────────────┘└────────┘ │
└────────────────────────────────────────────────────────────────┘
```

- Grid de 12 colunas a partir de `lg` (1024 px), com gap de 24 px. Abaixo disso, uma coluna.
- Alinhamento: rótulos e textos à esquerda; números centralizados em suas caixas; títulos de seção à esquerda com ícone na cor do tema.
- **PokéPapo**: largura total 444 px, sobreposição de −64 px e padding `16 px 16 px 16 px 80px` (64 + 16), o que corrige a assimetria. Abaixo de `lg` a gaveta vira overlay sobre o console, sem empurrá-lo.
- Breakpoints: `sm` 640 mostra as pílulas do header; `md` 768 abre duas colunas de cards; `lg` 1024 ativa o grid de 12 e a gaveta lado a lado.

---

## 5. Componentes (medidas já corrigidas)

**Campo rotulado** (InfoField, Classe N, Frase)
Altura `control-md` (40), raio `control`, borda `regular`, sombra `hard-sm`. O rótulo fica à esquerda, com fundo na cor do tema, texto `label` branco e 80 px de largura. Divisória pontilhada de 2 px separa o valor, que usa `input` (14) em `zinc-900`. O nível da classe fica numa caixa de 40 px à direita, com o mesmo fundo do tema.

**Nome do personagem**
Borda `strong`, raio `card`, sombra `hard-md`, fundo na cor do tema. Rótulo "Identidade" em `label` e nome em `title` (36) branco itálico.

**DerivedBox**
Altura 48, raio `inset`, borda `regular`, sombra `hard-sm`. Ícone em quadrado de 32 px, raio `sm`, fundo do tema com `shadow-inner`. Rótulo em `label` `zinc-500` e valor em `value` (24). O hover pode manter `scale-105`, mas só em itens clicáveis.

**Card de seção**
Raio `card`, borda `regular`, `p-4`, sombra `hard-md`. Título em `lead` (16) com ícone de 16 px e divisória `hairline` abaixo (`pb-2 mb-3`).

**Painel de destaque** (Talentos, Evasão, Moves)
Raio `panel`, borda `strong`, `p-4`, sombra `hard-lg`. O rótulo vertical usa `title` na cor do tema com `tracking-[0.12em]`.

**Abas**
Formato `pill`, altura `control-sm` (32), `px-4`, texto `label`, ícone de 12 px e `gap-2`. A aba ativa usa fundo do tema, texto branco e sombra `hard-sm`; a inativa usa `zinc-100` com texto `zinc-600`. O `scale-105` sai: a mudança de cor já sinaliza o estado e o scale desalinha a linha. O botão de fechar aba é um `icon-button` sm.

**Barra de HP**
Trilho de 40 px, raio `inset`, borda `regular`, `p-1`, `shadow-inner`. O preenchimento tem raio `control` e a cor do tema; abaixo de 25% muda para `status.danger`. O rótulo "HP 12/40" fica acima, em `label`.

**Chip de talento**
Altura `control-sm`, raio `control`, borda 2 px `zinc-200`, que fica preta no hover. Nome em `caption` itálico caixa alta e botão remover como `icon-button` sm.

**Rank de perícia**
Grupo segmentado com raio `sm` e botões de 28 × 28 px. Ativo com fundo do tema e texto branco em `label`.

**Tabela** (Mochila)
Cabeçalho em `label` sobre `zinc-100`; células `px-4 py-3`; nome em `lead` itálico e descrição em `caption` `zinc-500`. Os botões de quantidade usam `icon-button` sm com raio `sm`.

**AttackCard**
Mantém a identidade de carta impressa: raio 0, borda `print` (3 px), largura máxima 280. O cabeçalho usa `colors.types.<tipo>.bg` e `.fg`, com nome em `lead` itálico. As linhas de dados usam `caption` com `py-2`, a descrição usa `body` e tem altura mínima de 88. Os botões de rolagem ficam em `control-sm`, raio `sm` e texto `label`. Acurácia usa `blue-600` e dano usa `rose-600`; essas cores são fixas e não seguem o tema.

**PokéPapo**
A tela interna usa raio `card` e sombra `float`. Cabeçalho com altura de 48 px, texto `label` e indicador online de 10 px. Mensagens em `body` dentro de um balão com raio `control`. O input é `control-md` e o botão Enviar é `control-sm`.

**Header do console**
Lente de 40 px com borda branca de 4 px e `glow`. Swatches de tema em 20 px, com 8 px de gap e anel branco de 2 px no ativo. Pílulas em `control-sm`, `bg-black/40`, texto `label`. Botões de ícone em 36 px.

**Modais e tela de erro**
Raio `panel`, `p-6`, sombra `overlay`. Ícone em `display`, título em `heading`, texto em `body` e CTA em `control-lg`.

---

## 6. Cores: regras de uso

- **Uma família de cinza: `zinc`.** Todo `gray-*` e `slate-*` vira o `zinc-*` de mesmo número. A única exceção é o backdrop `#0f172a`.
- **A cor do tema** vem sempre de `--theme-color` ou `currentTheme.color`. Nenhum componente define uma cor de destaque própria.
- **Tipos Pokémon** usam somente `colors.types`. O mapa `TYPE_BG_CLASSES` do `AttackCard` deve passar a ler essa tabela, para que o mesmo tipo tenha a mesma cor em toda a interface. A cor do texto (`fg`) foi escolhida pelo maior contraste com o fundo.
- `zinc-400` serve só para placeholder e estado desabilitado. Para texto secundário legível, use `zinc-500` ou `zinc-600`.
- Os cursores de Pokébola usam `#f43f5e` fixo, independente do tema. Isso é intencional: o cursor é um objeto, não parte da carcaça.

---

## 7. Movimento

- Transição padrão de 150 ms em cor, borda, sombra e opacidade. A troca de tema leva 500 ms.
- `hover:scale-105` fica só em objetos clicáveis "físicos" (avatar, DerivedBox, AttackCard, botões primários). Não vale para abas, linhas de tabela ou chips.
- `active:scale-95` vale em todo botão.
- Efeitos contínuos (lente pulsando, holograma, indicador online) são os únicos movimentos automáticos.
- Respeite `prefers-reduced-motion`: desligue pulse, flicker, scan e scale nesse caso.

---

## 8. Checklist para telas novas

1. Nenhum valor entre colchetes para tamanho, espaço ou raio. Se faltar um token, adicione-o aqui primeiro.
2. Nenhum texto abaixo de 11 px, e nenhum `font-black` abaixo de 14 px.
3. Todo controle tem altura de 32, 40 ou 48 px, e todo alvo clicável tem no mínimo 32 × 32 px.
4. Raio interno = raio externo − padding.
5. Borda de 2 px por padrão; 4 px só em destaque.
6. Sombra dura para objetos, sombra suave só para o que flutua.
7. Só `zinc` para neutros, só `--theme-color` para destaque, só `colors.types` para tipos.
8. Números ficam em `SmartInput` quando são editáveis e voláteis (HP).
9. Nada de scrollbars visíveis; o scroll continua funcionando.
10. Serifa só no editor de Notas.

---

## 9. Ordem sugerida de migração

1. Criar os tokens no `tailwind.config.ts` (`fontSize`, `borderRadius`, `boxShadow`, `colors.type`) e no `:root` do `index.css`.
2. Migrar os componentes compartilhados: `InfoField`, `DerivedBox`, `AttackCard`, `SmartInput`.
3. Migrar o shell do `App.tsx`: header, abas, gutter e padding de conteúdo.
4. Migrar as abas Treinador, Combate e Mochila.
5. Migrar `TeamTab`, `PcTab`, `PokemonCreationSheet` (é o arquivo com mais `text-[7px]`/`[8px]` e 43 estilos inline), `NotesTab` e `TradeModal`.
6. Migrar o `PokePapo`, corrigindo o padding esquerdo.
7. Buscar `\[[0-9]+px\]`, `gray-` e `slate-` no projeto. O objetivo é chegar a zero, exceto nas exceções documentadas aqui.
