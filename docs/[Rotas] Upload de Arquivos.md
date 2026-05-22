# 📤 Upload de Arquivos

> Especificação da rota de API de upload do [[Trainer Card Pro]], responsável por substituir o armazenamento de Base64 em localStorage por arquivos físicos no servidor.

---

## 📍 Endpoint: `POST /api/upload`

Esta rota lida com envio de arquivos de imagem (`multipart/form-data`) e salva as imagens localmente na pasta estática pública do servidor.

### 📥 Payload (Request)

A requisição deve ser feita com o cabeçalho `Content-Type: multipart/form-data`.

**Campos obrigatórios do FormData:**
- `file` (File/Blob): O arquivo binário da imagem (avatar do treinador ou foto de um pokémon/item).
- `characterId` (String): O ID do personagem ao qual a imagem pertence (usado para separar os diretórios).

**Exemplo no Client:**
```javascript
const formData = new FormData();
formData.append("file", croppedImageBlob, "avatar.png");
formData.append("characterId", "char-uuid-12345");

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData, // fetch define o boundary do multipart automaticamente
});
const data = await response.json();
console.log(data.url); // "/uploads/char-uuid-12345/avatar.png"
```

### ⚙️ Lógica Interna

1. O backend recebe o `FormData`.
2. O nome original do arquivo passa por uma **sanitização Regex** (`/[^a-zA-Z0-9.\-_]/g`) para remover caracteres especiais, espaços ou símbolos, prevenindo injeções de diretório ou quebras em diferentes OS.
3. O diretório físico é construído concatenando a raiz do projeto: `public/uploads/{characterId}`.
4. Se a pasta do `characterId` não existir, o Next.js (via módulo nativo `fs/promises`) a cria automaticamente.
5. O buffer da imagem é escrito fisicamente no disco.

### 📤 Respostas

#### Sucesso (201 Created)
Retorna o caminho **relativo estático**, que já pode ser injetado diretamente em tags `<img src={data.url} />` no Front-end ou salvo no Banco de Dados (Prisma).

```json
{
  "url": "/uploads/char-uuid-12345/avatar.png"
}
```

#### Erro de Validação (400 Bad Request)
Quando falta o arquivo ou o ID do personagem.

```json
{
  "error": "Arquivo ou characterId ausente na requisição."
}
```

#### Erro Interno (500 Server Error)
Quando ocorre falha de gravação de I/O no disco físico.

```json
{
  "error": "Erro interno no servidor ao processar o upload."
}
```
