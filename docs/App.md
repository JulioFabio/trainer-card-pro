# 🏠 App

> Componente raiz do [[Trainer Card Pro]].
> Arquivo: `App.tsx` — **802 linhas**

---

## Visão Geral

O `App` é o **componente-mãe** que orquestra todo o estado, cálculos e navegação da ficha. Ele renderiza:
1. **Header** com tema seletor, contadores e botões de gestão
2. **Abas** de navegação (6 abas)
3. **Conteúdo** condicional por aba ativa
4. **Footer** temático
5. **Modais** flutuantes (tooltip de talentos, [[ImageCropper]])

---

## Estado (State)

| Variável | Tipo | Descrição |
|---|---|---|
| `trainer` | [[Types#TrainerData]] | Estado completo da ficha |
| `activeTab` | `Tab` | Aba ativa (`'treinador' \| 'combate' \| 'equipe' \| 'mochila' \| 'notas' \| 'computador'`) |
| `currentTheme` | [[Constants#PokedexTheme]] | Tema de cores atual |
| `newItemName` | `string` | Nome do novo item (inventário) |
| `newItemDesc` | `string` | Descrição do novo item |
| `newItemQty` | `number` | Quantidade do novo item |
| `newTalent` | `string` | Nome do novo talento |
| `newTalentDesc` | `string` | Descrição do novo talento |
| `hoveredTalent` | `{ content, x, y } \| null` | Tooltip de talento |
| `showOnlyTrained` | `boolean` | Filtro de perícias treinadas |
| `imageToCrop` | `string \| null` | Imagem base64 para recorte |

---

## Valores Derivados (useMemo)

| Nome | Dependências | Fórmula | Referência |
|---|---|---|---|
| `calculatedHpMax` | `saude`, `levelGeral` | `(Saúde + Nível) × 4` | [[Features#HP Máximo]] |
| `calculatedEvasion` | `defesa`, `defEspecial`, `velocidade` | `floor(stat / 5)` | [[Features#Evasões]] |
| `calculatedMovement` | `velocidade` | `5 + floor(vel/2)` → derivados | [[Features#Movimentação]] |
| `totalSpentPoints` | `stats` | `Σ todos stats` | [[Features#Pontos de Atributo]] |
| `calculatedMaxPoints` | `levelGeral` | Fórmula escalonada | [[Features#Pontos de Atributo]] |
| `calculatedMaxTalents` | `levelGeral` | Fórmula escalonada | [[Features#Máximo de Talentos]] |
| `calculatedStatCap` | `levelGeral` | `14 + floor(Nível/2)` | [[Features#Cap de Atributo]] |

---

## Effects (useEffect)

| Efeito | Trigger | Ação |
|---|---|---|
| Clamp HP | `calculatedHpMax`, `hpActual` | Se HP atual > máximo, ajusta |
| Auto-save dados | `trainer` | `localStorage.setItem(STORAGE_KEY, ...)` |
| Auto-save tema | `currentTheme` | `localStorage.setItem('trainer_card_pro_theme', ...)` |
| Prevent close | mount | Registra `beforeunload` event |

---

## Handlers

| Função | Descrição |
|---|---|
| `handleStatChange` | Atualiza um atributo específico (clamp ≥ 0) |
| `handleProfileChange` | Atualiza qualquer campo de [[Types#TrainerData]] |
| `handleAvatarUpload` | Lê imagem e envia para [[ImageCropper]] |
| `exportData` | Exporta ficha como JSON (File System API ou fallback) |
| `importData` | Importa JSON e faz merge com dados iniciais |
| `resetTrainer` | Restaura dados iniciais (com `confirm()`) |
| `addItem` | Adiciona item ao inventário |
| `updateItemQty` | Incrementa/decrementa quantidade de item |
| `addTalent` | Adiciona talento com nome e descrição |
| `removeTalent` | Remove talento por índice |
| `handleTalentHover` | Posiciona tooltip do talento |
| `handleSkillChange` | Altera rank ou bônus de uma perícia |
| `calculateSkillTotal` | Calcula total da perícia (Trained/Expert) |
| `calculateModifier` | `floor((valor - 10) / 2)` |

---

## Aba Treinador

Renderiza quando `activeTab === 'treinador'`:

```mermaid
graph TD
    AT["Aba Treinador"] --> AV["Avatar + ImageCropper"]
    AT --> ID["Identidade (Nome, Frase, Nível)"]
    AT --> BIO["Dados Biográficos (InfoField ×7)"]
    AT --> CL["Classes de Carreira (×4)"]
    AT --> MOV["Movimentos (DerivedBox ×3)"]
    AT --> TAL["Talentos (lista + form)"]
```

---

## Aba Combate

Renderiza quando `activeTab === 'combate'`:

```mermaid
graph TD
    AC["Aba Combate"] --> HP["Barra de HP + SmartInput"]
    AC --> STATS["Grid de Atributos (×6)"]
    AC --> PTS["Pontos Gastos / Máx"]
    AC --> SK["Perícias (×30+)"]
    AC --> EV["Evasões (DerivedBox ×3)"]
    AC --> MV["Movimentos (DerivedBox ×3)"]
```

---

## Aba Mochila

Renderiza quando `activeTab === 'mochila'`:
- Formulário de adição de itens
- Tabela CRUD de inventário

---

## Componentes Filhos Diretos

| Componente | Aba(s) | Propósito |
|---|---|---|
| [[InfoField]] | Treinador | Campos de dados biográficos |
| [[DerivedBox]] | Treinador, Combate | Valores derivados (evasão, movimento) |
| [[SmartInput]] | Combate | Input numérico inteligente |
| [[NotesTab]] | Notas | Editor de anotações |
| [[PcTab]] | PC | Sistema de caixas |
| [[TeamTab]] | Equipe | Pokémon ativos |
| [[ImageCropper]] | Treinador | Crop de avatar |

---

## Layout Visual

```
┌──────────────────────────────────────────────┐
│  HEADER: 🔵 Tema Seletor │ Dias │ Pokédex │ │
│          │ Export │ Import │ Reset │          │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │ 🧑 Treinador │ ⚔️ Combate │ 👥 Equipe │  │
│  │ 🎒 Mochila  │ 💻 PC     │ 📝 Notas  │  │
│  ├────────────────────────────────────────┤  │
│  │                                        │  │
│  │         CONTEÚDO DA ABA ATIVA          │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
├──────────────────────────────────────────────┤
│  FOOTER: ADVANCED POKEDEX OS // JOGADOR: X  │
└──────────────────────────────────────────────┘
```

---

## CSS Variables Propagadas

```typescript
const rootStyle = {
  '--theme-color': currentTheme.color,
  '--scrollbar-color': `${currentTheme.color}66`,
  '--scrollbar-color-hover': `${currentTheme.color}aa`,
};
```

Usadas pelo [[Estilos|CSS global]] para estilizar scrollbars customizadas.

---

## 🏷️ Tags
#componente #principal #estado #layout
