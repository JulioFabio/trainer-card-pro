---
tags: [documentacao-viva, projeto, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-06-15
autor: "Antigravity"
---

# 🧩 Features

> Lista completa de funcionalidades do [[Trainer Card Pro]].

---

## 💾 Persistência de Dados

### Banco de Dados SQLite Relacional (Auto-save)
- **Primary Source of Truth**: Os dados do personagem (`TrainerData`), itens, pokémons e notas são salvos no banco de dados SQLite por meio do Prisma ORM nas rotas de API `/api/character`, `/api/note`, etc.
- **Sincronização Atômica**: O componente [[App]] monitora mudanças no estado `trainer` e dispara automaticamente requisições assíncronas `PUT` de auto-save com debounce de 1s.

### Fallback em LocalStorage (Resiliência Offline)
- Se as chamadas para a API de auto-save falharem por problemas de rede, o aplicativo salva uma cópia de segurança em `localStorage` sob a chave `trainer_card_pro_offline_backup` para evitar qualquer perda de dados, exibindo o status visual "Erro ao salvar (Salvo Localmente)" no cabeçalho.
- O ID do tema selecionado continua sendo gravado localmente na chave `trainer_card_pro_theme`.

### Proteção contra perda
- Evento `beforeunload` registrado no navegador para alertar o usuário caso ele tente fechar ou atualizar a aba enquanto a sincronização está pendente ou ativa.

---

## 🎨 Sistema de Temas

O sistema de [[Constants#PokedexTheme|temas visuais]] permite trocar toda a paleta de cores da interface.

| Tema | ID | Cor Principal | Classe Main |
|---|---|---|---|
| Rose | `rose` | `#e11d48` | `bg-rose-600` |
| Blue | `blue` | `#2563eb` | `bg-blue-600` |
| Emerald | `emerald` | `#059669` | `bg-emerald-600` |
| Amber | `amber` | `#d97706` | `bg-amber-600` |
| Slate | `slate` | `#334155` | `bg-slate-700` |

Cada tema define:
- `id` — identificação
- `main`, `dark`, `light`, `text` — classes CSS Tailwind do tema
- `color` — cor hexadecimal principal usada em todo o app

A cor é propagada via:
- CSS custom properties: `--theme-color`, `--scrollbar-color`, `--scrollbar-color-hover`
- Inline styles: `style={{ backgroundColor: currentTheme.color }}`

---

## 📊 Cálculos Automáticos (Motor de Regras)

O [[App]] calcula automaticamente valores derivados das regras do PTU usando `useMemo`:

### HP Máximo
```
HP Máximo = (Saúde + Nível Geral) × 4
```
- Se `hpActual > calculatedHpMax`, o HP atual é automaticamente clampado via `useEffect`.

### Evasões
```
Evasão Física    = floor(Defesa / 5)
Evasão Especial  = floor(Def. Especial / 5)  
Evasão Veloz     = floor(Velocidade / 5)
```

### Movimentação
```
Terrestre   = 5 + floor(Velocidade / 2)
Natação     = floor(Terrestre / 2)
Subaquático = floor(Natação / 2)
```

### Pontos de Atributo
```
Pontos Gastos  = Soma de todos os stats
Pontos Máximos = 66 + Nível (se Nível ≤ 10)
                 76 + ceil((Nível - 10) / 2) (se Nível > 10)
```
- Exibe alerta visual (vermelho pulsante) se `pontosGastos > pontosMaximos`.

### Cap de Atributo
```
Cap = 14 + floor(Nível Geral / 2)
```

### Máximo de Talentos
```
Máx Talentos = 2 + Nível (se Nível ≤ 10)
               12 + ceil((Nível - 10) / 2) (se Nível > 10)
```

### Modificador de Atributo
```
Modificador = floor((Valor - 10) / 2)
```

### Perícias (Skills)
```
Se attr = 'saude'   → Apenas "Possui" (rank > 0) ou "Não Possui"
Se rank = 0         → d20 (sem bônus)
Se rank = 1 (Trained) → d20 + 2 + Mod + Bônus
Se rank = 2 (Expert)  → d20 + 4 + (2 × Mod) + Bônus
```

---

## 🧑 Aba Treinador

### Avatar
- Upload de imagem com preview
- Crop via [[ImageCropper]] antes de salvar
- Hover mostra ícone de câmera

### Identidade
- **Nome do Personagem** — campo editável estilizado na cor do tema
- **Conceito / Frase** — subtítulo do personagem
- **Nível Geral** — motor de todos os cálculos automáticos

### Dados Biográficos
Renderizados via componentes [[InfoField]]:
- Idade, Gênero, Peso, Altura, Naturalidade, Jogador, Campanha

### Classes de Carreira
- 4 slots de classe com nome e nível individual
- Campos dinâmicos: `classe1..4` e `level1..4`

### Capacidade de Movimento
- Exibido via [[DerivedBox]] — valores calculados automaticamente
- Terrestre, Natação, Subaquático

### Talentos
- Lista com contador `atual / máximo`
- Cada talento tem `name` e `description`
- Tooltip no hover mostrando a descrição (componente flutuante com `position: fixed`)
- Botão de remoção individual
- Formulário de adição com Enter para submeter

---

## ⚔️ Aba Combate

### Barra de HP
- Barra de progresso visual com cor do tema
- Campo de input para HP atual (limitado ao máximo calculado)
- Exibe `HP Atual / HP Máximo`

### Grid de Atributos
6 atributos editáveis ([[Types#Stats]]):
- Saúde, Ataque, Defesa, Atq. Especial, Def. Especial, Velocidade
- Cada atributo exibe seu **Modificador** calculado automaticamente
- Exibe contagem de **Pontos Gastos / Máximo**

### Perícias (Skills)
- Lista completa de 30+ perícias do PTU
- Cada perícia tem:
  - **Atributo associado** (e seu modificador)
  - **Rank**: Untrained (-), Trained (T), Expert (E) — seleção via botões toggle
  - **Bônus**: campo numérico adicional
  - **Total calculado** automaticamente
- Filtro "Mostrar apenas treinadas" toggle
- Perícias de Saúde são binárias (SIM / -)

### Evasões
- Exibidas via [[DerivedBox]] — calculadas automaticamente dos atributos
- Física, Especial, Veloz

### Movimentos
- Exibidos via [[DerivedBox]] — calculados automaticamente
- Terrestre, Natação, Subaquático

---

## 👥 Aba Equipe

Ver: [[TeamTab]]

- Exibe até **6 Pokémon** ativos no time
- Cards visuais com imagem, nome, espécie, tipos, HP, level
- Drag & Drop implícito via botões de gerenciamento
- Integração bidirecional com o [[PcTab|sistema de PC]]
- Botão para **criar novo Pokémon** abre o [[PokemonCreationSheet]]
- Botão para **editar** Pokémon existente
- Botão para **devolver ao PC** (move do time para uma box)

---

## 🎒 Aba Mochila

### Inventário
- Formulário de adição: Nome, Descrição, Quantidade inicial
- Tabela com colunas: Descrição do Item | Quantidade | Ação
- Controle de quantidade com botões +/- (mínimo 0)
- Botão de deletar item (ícone lixeira)
- Estado vazio: "A mochila está vazia"

---

## 💻 Aba PC (Computador)

Ver: [[PcTab]]

- **99 caixas** de armazenamento (sistema PC dos jogos Pokémon)
- Navegação entre boxes com setas ← →
- Renomear boxes inline
- Grid de **30 slots** por box
- Cada slot pode conter um [[Types#StoredPokemon|Pokémon]]
- Clique em slot vazio → abre [[PokemonCreationSheet]] para criar
- Clique em Pokémon → abre sheet para editar
- Drag & drop implícito via lógica de slots
- Botão para mover Pokémon para a equipe

---

## 📝 Aba Notas

Ver: [[NotesTab]]

- **Editor de texto livre** com formatação Markdown
- Toggle entre modo **Edição** e modo **Visualização**
- Renderiza Markdown estendido usando a biblioteca `react-markdown` e o plugin `remark-gfm` para suporte a tabelas, riscado, checklists de tarefas e outros elementos do GitHub Flavored Markdown.

---

## 🖼️ Crop de Imagem

Ver: [[ImageCropper]]

- Modal para recortar imagens antes de salvar
- Controles de **zoom** (slider + scroll do mouse)
- **Drag** para mover a área de corte
- Preview do resultado em canvas
- Usado no avatar do treinador e na foto de cada Pokémon

---

## 🐾 Ficha de Pokémon

Ver: [[PokemonCreationSheet]]

A sheet de criação/edição de Pokémon é organizada em **4 sub-abas**:

### Painel Esquerdo (35%)
- Upload de foto com crop
- Level, Espécie, Nome
- Barra de HP (atual/máximo)
- Tipagem dual (19 tipos disponíveis)
- Gênero (Macho/Fêmea/Unknown)
- Natureza (35 naturezas com bônus/penalidade)
- Bônus de Dano Elemental

### Sub-aba Stats
- Tabela com colunas: Base | Lvl | Fase | Total
- 6 atributos: Saúde, Ataque, Defesa, Atq Especial, Def Especial, Velocidade
- `Total = Base + Lvl`
- HP recalculado quando Saúde muda

### Sub-aba Capacidades
- **Traço de Capacidades** (nome + descrição)
- **Força/Inteligência/Salto**: valor numérico com descrição automática via [[Capabilities]]
- **Deslocamentos**: Terrestre, Natação, Voo, Subaquático, Escavação
- **Evasões**: Física, Especial, Veloz

### Sub-aba Golpes
- Grid 2×4 com **8 slots de golpe**
- Cada golpe tem: Nome, Tipo (com cor), Descritor, Precisão, Frequência, Alcance, Dano, Categoria, Descrição
- Header colorido pelo tipo do golpe

### Sub-aba Habilidades
- **2 slots** de habilidade (nome + descrição)
- Campos de texto livres

---

## 🏷️ Tags
#features #funcionalidades #documentação
