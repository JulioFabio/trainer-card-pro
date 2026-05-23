---
tags: [documentacao-viva, projeto, api, rotas, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-05-23
autor: "Antigravity"
---

# 🛣️ Rotas: API da Ficha

> Especificação dos endpoints CRUD que gerenciam o estado do personagem, seus pokémons, itens, anotações e trocas no [[Trainer Card Pro]], focando na robustez contra falhas de serialização e integridade referencial.

---

## 🛡️ Robustez e Proteção de Dados (Melhorias de Segurança)

Para suportar o ambiente de produção local do Next.js de forma resiliente, foram implementadas três camadas de segurança nos controladores de rotas backend:

### 1. Parsing Seguro de JSON (Strings SQLite)
Como o SQLite não possui tipo JSON nativo robusto, o Prisma armazena objetos complexos de ficha (`sheetData`) e pokémon (`pokemonData`) como Strings planas.
- **Risco**: Se a string for nula, vazia (`""`) ou corrompida, o `JSON.parse` direto dispara uma exceção no servidor que quebra o ciclo de renderização do Next.js, causando telas brancas infinitas.
- **Solução**: Todas as rotas que manipulam desserialização de JSON implementam blocos `try-catch` com fallback para estruturas vazias limpas (`{}`) ou valores padrão da ficha.

### 2. Upsert Automático de Usuário (Integridade Referencial)
- **Risco**: A criação de um personagem exige um `userId` válido apontando para a tabela `User` devido às restrições de chave estrangeira (`Foreign Key constraint`). Em um banco SQLite recém-inicializado (`dev.db` vazio), tentar salvar um personagem disparava o erro crítico do Prisma `P2003` (Foreign key constraint failed).
- **Solução**: O endpoint `/api/character` executa um comando automático `prisma.user.upsert` na carga inicial. Se o usuário administrador/jogador padrão não existir na base local, ele é criado preventivamente em tempo de execução, abrindo espaço para a inserção limpa do personagem.

---

## 🗃️ `/api/character`

Gerencia a entidade principal (Ficha do Treinador).

### `GET`
Busca a ficha completa de um personagem, fazendo o *parse* seguro automático do campo flexível `sheetData` (JSON String) para um objeto Javascript nativo e hidratando as relações de Pokémons, Itens e Notas de diário.
- **Query Params:** `?id=<character_id>`
- **Resposta:** Objeto `Character` completo com arrays de relações.

### `POST`
Cria um novo personagem. Executa previamente o `upsert` do usuário correspondente para assegurar a integridade da chave estrangeira.
- **Body:** `{ name, userId, level?, money?, avatarUrl?, sheetData? }`
- **Nota:** `sheetData` é passado como objeto e serializado pelo servidor.

### `PUT`
Atualiza os dados de um personagem existente de forma atômica no banco SQLite.
- **Body:** `{ id, ...campos_atualizados }`

---

## 🐾 `/api/pokemon`

Gerencia as capturas, stats e a mecânica de Equipe (Party) vs PC.

### `POST`
Registra um novo pokémon na equipe ou PC box.
- **Body:** `{ nickname, species, characterId, isParty?, boxName?, imageUrl?, pokemonData? }`

### `PUT`
Atualiza os dados, customizações ou a localização física do pokémon (trocando de boxes ou time ativo).
- **Body:** `{ id, ...campos }`

### `DELETE`
Exclui o registro do pokémon do banco de dados (libertação definitiva).
- **Query Params:** `?id=<pokemon_id>`

---

## 🎒 `/api/item`

Gerencia o inventário (mochila).

### `POST`
Adiciona um novo tipo de item na mochila.
- **Body:** `{ name, characterId, description?, quantity?, imageUrl? }`

### `PUT`
Atualiza bônus, quantidade de cargas ou estoque de um item existente.
- **Body:** `{ id, quantity }`

### `DELETE`
Descarta e deleta permanentemente o item do banco.
- **Query Params:** `?id=<item_id>`

---

## 📝 `/api/note`

Gerencia as anotações do diário de campanha.

### `POST`
Cria uma nova nota vazia vinculada à ficha.
- **Body:** `{ title, characterId, content? }`

### `PUT`
Salva o texto formatado em Markdown nas anotações.
- **Body:** `{ id, content }`

---

## 🔀 `/api/trade` (Sistema de Trocas)

Permite propor e gerenciar negociações entre dois personagens no banco SQLite. 
- **Melhoria**: Import do banco foi padronizado para caminho relativo (`../../../lib/prisma`) e implementado `try-catch` robusto para validação e serialização de dados de trocas.

---

## 🏷️ Tags
#api #rotas #endpoints #backend #prisma #robustez #json #seguranca #user-upsert
