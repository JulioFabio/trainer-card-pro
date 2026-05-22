# 🛣️ Rotas: API da Ficha

> Especificação dos endpoints CRUD que gerenciam o estado do personagem, seus pokémons, itens e anotações no [[Trainer Card Pro]].

---

## 🗃️ `/api/character`

Gerencia a entidade principal (Ficha do Treinador).

### `GET`
Busca a ficha completa de um personagem, fazendo o *parse* automático do campo flexível `sheetData` (JSON String) para um objeto Javascript nativo e injetando as relações (Pokémons, Itens, Notas).
- **Query Params:** `?id=<character_id>`
- **Resposta:** Objeto `Character` completo com arrays aninhados.

### `POST`
Cria um novo personagem.
- **Body:** `{ name, userId, level?, money?, avatarUrl?, sheetData? }`
- **Nota:** `sheetData` (se fornecido) deve ser um objeto JS. A API cuida do `JSON.stringify`.

### `PUT`
Atualiza os dados de um personagem existente. O Auto-Save do front-end fará chamadas `PUT` contínuas para persistir a ficha.
- **Body:** `{ id, ...campos_atualizados }`

---

## 🐾 `/api/pokemon`

Gerencia as capturas, stats e a mecânica de Equipe (Party) vs PC.

### `POST`
Registra um novo pokémon.
- **Body:** `{ nickname, species, characterId, isParty?, boxName?, imageUrl?, pokemonData? }`

### `PUT`
Atualiza um pokémon existente. 
> **Mecânica de PC/Equipe:** Para enviar um pokémon da equipe para o PC, basta enviar um `PUT` com `{ id: "poke_id", isParty: false, boxName: "Box 1" }`. Para trazer de volta à equipe, `{ id: "poke_id", isParty: true }`.
- **Body:** `{ id, ...campos }`

### `DELETE`
Liberta (deleta) o pokémon permanentemente.
- **Query Params:** `?id=<pokemon_id>`

---

## 🎒 `/api/item`

Gerencia o inventário (mochila).

### `POST`
Adiciona um novo tipo de item.
- **Body:** `{ name, characterId, description?, quantity?, imageUrl? }`

### `PUT`
Atualiza detalhes ou *stack* do item (ex: incrementando ou consumindo).
- **Body:** `{ id, quantity: 5 }`

### `DELETE`
Descarta o item por completo.
- **Query Params:** `?id=<item_id>`

---

## 📝 `/api/note`

Gerencia as anotações do diário de campanha.

### `POST`
Cria uma nova página/nota vazia.
- **Body:** `{ title, characterId, content? }`

### `PUT`
Salva o texto rico em Markdown.
- **Body:** `{ id, content: "## Novo Encontro..." }`

### `DELETE`
Exclui a nota.
- **Query Params:** `?id=<note_id>`
