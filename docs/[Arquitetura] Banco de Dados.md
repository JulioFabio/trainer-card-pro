# 🗄️ Arquitetura de Banco de Dados

> Especificação da estrutura de dados relacionais e modelo de persistência do [[Trainer Card Pro]], implementada com SQLite e Prisma ORM (Fase 1).

---

## 🏗️ Princípios de Design

1. **Separação Jogador vs Personagem (A Regra de Ouro)**:
   - Um **Usuário** (`User`) representa a conta física do jogador ou mestre (GM).
   - Um **Personagem** (`Character`) representa a entidade in-game (Ficha). Um único usuário pode ter vários personagens (ex: jogar em duas mesas diferentes).
2. **Dados Flexíveis (JSON)**:
   - Para evitar tabelas gigantes com centenas de colunas esparsas para cada atributo, perícia, talento e HP da ficha, foi adotada a estratégia de "Campos Flexíveis" em JSON (como `sheetData` e `pokemonData`). O Prisma armazena isso como String no SQLite, e o Backend converte para JSON nas requisições da API.
3. **Escalabilidade (Preparado para PostgreSQL/MySQL)**:
   - Toda a estrutura foi definida de maneira agnóstica via Prisma. Migrar do SQLite para um banco em nuvem posteriormente exige apenas trocar o *provider* no Prisma.

---

## 📊 Diagrama de Esquema (Entidade-Relacionamento)

```mermaid
erDiagram
    User ||--o{ Character : "possui"
    Character ||--o{ Item : "carrega na mochila"
    Character ||--o{ Pokemon : "capturou"
    Character ||--o{ Note : "escreveu"

    User {
        String id PK
        String username "unique"
        String role "PLAYER ou GM"
    }
    
    Character {
        String id PK
        String name
        Int level
        Int money
        String avatarUrl
        String sheetData "JSON (Stats, HP, Perícias, Talentos)"
        String userId FK
    }

    Item {
        String id PK
        String name
        String description
        Int quantity
        String imageUrl
        String characterId FK
    }

    Pokemon {
        String id PK
        String nickname
        String species
        Boolean isParty
        String boxName
        String imageUrl
        String pokemonData "JSON (Stats, Golpes, Habilidades)"
        String characterId FK
    }

    Note {
        String id PK
        String title
        String content "Markdown"
        String characterId FK
    }

    TradeRequest {
        String id PK
        String senderId "Character FK (não estrito)"
        String receiverId "Character FK (não estrito)"
        String status "PENDING | ACCEPTED | REJECTED"
    }
```

---

## 🗃️ Modelos Base

### User
Representa a conta autenticada.
- **id** (`String` / UUID)
- **username** (`String`, Único)
- **role** (`String`): Padrão "PLAYER", aceita "GM".

### Character
A ficha interativa em si.
- **id** (`String` / UUID)
- **name** (`String`)
- **level** (`Int`): Padrão `1`.
- **money** (`Int`): Padrão `0`.
- **avatarUrl** (`String?`): Caminho local para o avatar após o upload da crop.
- **sheetData** (`String` JSON): Guarda a árvore complexa da ficha: Atributos Atuais/Caps, AP, HP máximo e atual, lista de Talentos, classes, background, e conceitos estruturais não tabulados individualmente.
- **userId** (`String`): Referência obrigatória ao dono.

### Item
O inventário estruturado do personagem.
- **id** (`String` / UUID)
- **name** (`String`)
- **description** (`String?`)
- **quantity** (`Int`): Controla o contador, permitindo manipulação (`+`/`-`).
- **imageUrl** (`String?`)
- **characterId** (`String`): Referência obrigatória ao dono.

### Pokemon
Guarda tanto a equipe ativa (`Party`) quanto as caixas do PC (`PC Box`).
- **id** (`String` / UUID)
- **nickname** (`String`)
- **species** (`String`): Nome da espécie base.
- **isParty** (`Boolean`): Flag rápida. Se `true`, ele é exibido na aba Equipe.
- **boxName** (`String?`): Se `isParty = false`, este campo indica em qual pasta/caixa do PC ele se encontra.
- **imageUrl** (`String?`)
- **pokemonData** (`String` JSON): Guarda estatísticas de combate (ataque, defesa), evasões base, lista de movimentos (ataques) do Pokémon com dano e frequências, tipos, fraquezas.
- **characterId** (`String`): O treinador que possui o Pokémon.

### Note
As páginas do diário/caderno de anotações.
- **title** (`String`): Título da aba.
- **content** (`String`): O corpo do texto em puro Markdown, suportando GitHub Flavored Markdown (GFM).

### TradeRequest
Controla negociações p2p (trocas de itens ou pokémons entre dois Personagens).
- **senderId** (`String`): O ID do Character que propôs a troca.
- **receiverId** (`String`): O ID do Character destino.
- **status** (`String`): Enum simplificado (`PENDING`, `ACCEPTED`, `REJECTED`).
