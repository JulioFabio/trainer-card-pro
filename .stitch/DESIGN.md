---
name: Trainer Card Pro
version: 1.0.0
brand:
  name: Trainer Card Pro
  tagline: Ficha de personagem digital e interativa para o Sistema RPG Pokémon Tabletop Adventures 2.0 (PTA 2.0)
  description: Interface de gerenciamento de ficha de treinador, equipe ativa de Pokémon, inventário e notas.
colors:
  themes:
    rose:
      main: "#e11d48"
      dark: "#be123c"
      light: "#fff1f2"
      text: "#e11d48"
    blue:
      main: "#2563eb"
      dark: "#1d4ed8"
      light: "#eff6ff"
      text: "#2563eb"
    emerald:
      main: "#059669"
      dark: "#047857"
      light: "#ecfdf5"
      text: "#059669"
    amber:
      main: "#d97706"
      dark: "#b45309"
      light: "#fffbeb"
      text: "#d97706"
    slate:
      main: "#334155"
      dark: "#1e293b"
      light: "#f8fafc"
      text: "#334155"
  types:
    normal: "#919aa2"
    lutador: "#ce416b"
    voador: "#89aae3"
    venenoso: "#b566ce"
    terrestre: "#d97845"
    pedra: "#c5b78c"
    inseto: "#91c130"
    fantasma: "#5269ad"
    aco: "#5a8ea2"
    fogo: "#fe9d55"
    agua: "#508fd6"
    planta: "#63bc5a"
    eletrico: "#f4d23c"
    psiquico: "#fa7179"
    gelo: "#73cec0"
    dragao: "#0b6dc3"
    sombrio: "#5a5465"
    fada: "#ec8fe6"
    cristal: "#8e7cc3"
  neutrals:
    bg_base: "#ffffff"
    bg_surface: "#fafafa"
    bg_panel: "#f4f4f5"
    border_thick: "#000000"
    text_primary: "#18181b"
    text_secondary: "#71717a"
    text_muted: "#a1a1aa"
typography:
  fontFamilies:
    sans: "var(--font-outfit), sans-serif"
    serif: "ui-serif, Georgia, Cambria, Times New Roman, Times, serif"
  fontSizes:
    xs: "0.75rem"
    sm: "0.875rem"
    base: "1rem"
    lg: "1.125rem"
    xl: "1.25rem"
    2xl: "1.5rem"
    3xl: "1.875rem"
  fontWeights:
    normal: "400"
    bold: "700"
    black: "900"
spacing:
  gutter: "20px"
  drawer_visible_width: "380px"
  drawer_total_width: "444px"
  drawer_overlap: "-64px"
shapes:
  borderRadius:
    pokedex: "2.5rem"
    card: "1.5rem"
    input: "0.75rem"
    btn: "0.75rem"
    tag: "9999px"
  borders:
    thick: "4px solid #000000"
    medium: "2px solid #000000"
    light: "1px solid rgba(0,0,0,0.1)"
animations:
  hologram:
    flicker: "hologram-flicker 8s linear infinite"
    scan: "hologram-scan 4s linear infinite"
    glow: "hologram-glow-pulse 3s ease-in-out infinite"
---

# Diretrizes de Design - Trainer Card Pro

Este documento define o sistema de design visual, comportamento de interface e tokens do **Trainer Card Pro**. Ele serve como a especificação técnica e conceitual para garantir a consistência estética em futuras implementações.

---

## 1. Identidade Visual e Conceito

O **Trainer Card Pro** é projetado com a estética de uma **Pokédex eletrônica retrofuturista**, combinando elementos clássicos de interfaces de jogos portáteis com padrões modernos de experiência do usuário. 

### Princípios de Design:
*   **Imersão Temática:** O aplicativo deve parecer um dispositivo de hardware físico. A moldura do console centraliza as abas internas de navegação.
*   **Flat Design de Alto Contraste:** Uso de bordas pretas grossas (`border-black` com `border-2` ou `border-4`) que remetem ao visual de quadrinhos e mangás, contrastando com cores de destaque sólidas.
*   **Limpeza Tecnológica:** A separação visual entre painéis internos é feita através de sombras discretas (`shadow-[0_8px_30px_rgba(0,0,0,0.12)]`, `shadow-md`, `shadow-inner`) e cores de fundo contrastantes, evitando bordas cinzas ou pretas redundantes dentro dos subpainéis.
*   **Micro-interações:** Hover effects de escala suave (`hover:scale-105`), transições de cor rápidas (`duration-150`) e efeitos visuais imersivos, como o efeito holográfico digital nas fichas detalhadas dos Pokémon.

---

## 2. Sistema de Cores

O sistema de cores é dividido em três camadas principais:

### 2.1 Temas Globais da Pokédex
O usuário pode alternar dinamicamente a carcaça física da Pokédex entre 5 cores temáticas, controladas pelo token `{colors.themes}` no CSS e pelas variáveis de ambiente:
*   **Rose (Padrão):** Destaque `{colors.themes.rose.main}` (`#e11d48`).
*   **Blue:** Destaque `{colors.themes.blue.main}` (`#2563eb`).
*   **Emerald:** Destaque `{colors.themes.emerald.main}` (`#059669`).
*   **Amber:** Destaque `{colors.themes.amber.main}` (`#d97706`).
*   **Slate:** Destaque `{colors.themes.slate.main}` (`#334155`).

Estas cores definem a cor de fundo do frame do console, bordas ativas de seleção, botões primários e detalhes temáticos da interface.

### 2.2 Cores Específicas de Elementos (Tipagem Pokémon)
Utilizadas em cartões de ataque (`AttackCard.tsx`) e badges de tipo no cadastro do Pokémon (`PokemonCreationSheet.tsx`). Cada tipo possui um código hex hexadecimal correspondente de alto contraste `{colors.types}`:
*   Exemplos: Fogo (`#fe9d55`), Água (`#508fd6`), Planta (`#63bc5a`), Sombrio (`#5a5465`).

### 2.3 Neutros e Superfícies
As superfícies usam tons neutros puros para garantir legibilidade dos textos e separação limpa:
*   Fundo principal do app: Branco ou Cinza extra-claro (`#f4f4f5`).
*   Fundo de painéis secundários: `{colors.neutrals.bg_surface}` (`#fafafa`).
*   Textos: `{colors.neutrals.text_primary}` (`#18181b`) para títulos e corpos principais, `{colors.neutrals.text_secondary}` (`#71717a`) para subtextos e labels.

---

## 3. Tipografia

A tipografia é otimizada para legibilidade rápida de fichas de RPG e imersão em jogos:

*   **Fonte Principal (Sans-serif):** **Outfit** (`{typography.fontFamilies.sans}`). Uma fonte geométrica com cantos levemente arredondados, que complementa a estética de hardware do aplicativo. É utilizada globalmente em títulos, inputs, tabelas e menus.
*   **Fonte Secundária (Serif):** **Georgia / Times** (`{typography.fontFamilies.serif}`). Reservada exclusivamente para a aba de **Notas** (`NotesTab.tsx`), simulando um diário de jornada escrito à mão, promovendo imersão narrativa.
*   **Pesos de Fonte:**
    *   `font-black` (`900`): Utilizada para valores numéricos primários, títulos de abas e botões de ação.
    *   `font-bold` (`700`): Utilizada para labels de atributos e títulos secundários.
    *   `font-normal` (`400`): Utilizada para descrições de talentos, efeitos de ataques e notas de texto.

---

## 4. Estrutura Espacial e Layout

O layout base é projetado para maximizar o aproveitamento da tela sem gerar barras de rolagem nativas do navegador.

### 4.1 Frame Central e Gutters
*   **Gutter Global:** Distância constante de `20px` (`p-[20px]`) em todas as bordas da janela do navegador.
*   **Alinhamento:** O console central da Pokédex é centralizado horizontalmente e verticalmente, adaptando-se em altura e largura de forma fluida.

### 4.2 PokéPapo (Painel Lateral Retrátil)
*   **Largura Visível:** `{spacing.drawer_visible_width}` (`380px`).
*   **Design de Junção Perfeita:** Para evitar frestas nos cantos curvos do console, a gaveta se estende sob o console por `{spacing.drawer_overlap}` (`-64px`), com largura total de `{spacing.drawer_total_width}` (`444px`). O preenchimento interno esquerdo compensa essa sobreposição com `pl-[72px]`.
*   **Efeitos do Cabeçalho:** O cabeçalho do PokéPapo aplica um filtro de escurecimento semi-transparente (`bg-black/30`) sobre a cor temática ativa do aplicativo, combinando com o tom do console.

---

## 5. Padrões de Componentes

As interfaces internas seguem especificações estruturais estritas:

### 5.1 DerivedBox (Métricas Derivadas)
*   **Finalidade:** Exibe atributos calculados automaticamente (HP Máximo, Evasões, Capacidade de Movimento).
*   **Design:** Moldura branca com borda preta de `2px`, cantos arredondados (`rounded-2xl`) e sombra de deslocamento rígida (`shadow-[2px_2px_0px_rgba(0,0,0,0.1)]`).
*   **Ícones:** Alojados em um bloco quadrado de cor tema com sombras internas. Títulos dos atributos são pequenos (`text-[8px]`), pretos e rastreados em caixa alta.

### 5.2 AttackCard (Cartões de Ataque PTA 2.0)
*   **Finalidade:** Exibir os ataques de forma clara para combate ágil no log do PokéPapo.
*   **Estrutura:** Layout em grade de 2 colunas com bordas pretas grossas de `3px`.
*   **Divisórias:**
    *   Cabeçalho: Colorido conforme o tipo do ataque `{colors.types}`.
    *   Linha 1: Precisão (AC) / Damage Base (DB).
    *   Linha 2: Frequência / Alcance.
    *   Linha 3: Tipo / Descritor.
    *   Linha 4: Fórmula de Dano + Categoria (Físico/Especial/Status).
    *   Linha 5: Efeito textual em tamanho reduzido `{typography.fontSizes.xs}`.
    *   Rodapé: Botões de rolagem de acurácia e dano integrados.

### 5.3 Custom Cursors (Sistema de Ponteiros)
Para reforçar a experiência do aplicativo, cursores personalizados são embutidos usando SVGs codificados no CSS:
1.  **Ponteiro Padrão:** Seta branca clássica com uma pequena Pokébola na base.
2.  **Ponteiro Interativo (Hover):** Seta vermelha vibrante com Pokébola vermelha na base, aplicada a botões e elementos clicáveis.
3.  **Ponteiro de Texto (I-Beam):** Barra de digitação cinza com uma mini Pokébola acoplada no topo.

### 5.4 Efeito de Holograma (Hologram FX)
Utilizado para projeções virtuais nas janelas de detalhe de Pokémon:
1.  **Scanlines (`hologram-scanlines`):** Gradiente linear repetitivo vertical simulando telas CRT antigas com animação contínua de varredura vertical de 4 segundos.
2.  **Oscilação (`hologram-flicker`):** Animação de 8 segundos que varia a opacidade de forma intermitente para simular instabilidade de energia.
3.  **Glow (`hologram-glow-pulse`):** Sombra externa pulsante (`box-shadow`) que mistura a cor do tema ativo com tons transparentes a cada 3 segundos.

---

## 6. Diretrizes de Desenvolvimento (Do's and Don'ts)

### 🔴 O que NÃO fazer:
1.  **Não exibir barras de rolagem nativas:** Toda rolagem de conteúdo deve ser invisível (`no-scrollbar` ou `custom-scrollbar` com largura zero), mantendo o scroll funcional por gestos ou mouse wheel.
2.  **Não usar bordas grossas internas redundantes:** A separação interna de blocos não deve usar bordas escuras grossas, exceto nos componentes que especificam essa borda como identidade (ex: `AttackCard.tsx` e `DerivedBox.tsx`). Prefira sombras dinâmicas.
3.  **Não inventar cores fora do tema:** Todas as cores principais de botões, barras de progresso e focos devem usar as classes do tema ativo ou herdar o valor de `--theme-color` inline.
4.  **Não utilizar fontes serifadas fora das notas:** A fonte global deve ser estritamente `font-sans` (Outfit) para manter a uniformidade visual do sistema digital.

### 🟢 O que fazer:
1.  **Usar classes de transição:** Garanta que todos os botões, links e cards interativos possuam transições suaves de cor e opacidade (`transition-all duration-150 ease-out`).
2.  **Herdar cursor pointer:** Garanta que o cursor interativo de Pokébola vermelha seja ativado em qualquer elemento que possua interações de clique, aplicando a classe apropriada ou mantendo a regra de compatibilidade global do `index.css`.
3.  **Respeitar os limites de atributo:** Inputs de ficha que possuem limites de nível devem exibir avisos de erro ou cores alteradas caso excedam os limites calculados.
4.  **Preservar o suporte a operações matemáticas:** Qualquer entrada de valor numérico volátil (como HP atual) deve utilizar o componente `SmartInput` para permitir cálculos matemáticos diretos na caixa de texto.
