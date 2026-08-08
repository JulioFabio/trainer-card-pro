# 🛡️ Especificações de Autenticação e Segurança - Trainer Card Pro

**Stack Tecnológica:** Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma ORM 7, better-sqlite3, NextAuth.js (Auth.js).
**Contexto do Projeto:** Sistema de RPG de mesa focado em Pokémon. Cada utilizador tem uma conta, mas pode deter múltiplas fichas de personagens (regra de 1 para N).

## 🚀 Fases de Implementação

### Fase 1: Infraestrutura e Provedor OAuth2 (Discord)
O sistema utilizará exclusivamente o Discord para login, eliminando a necessidade de gestão de palavras-passe.

1. **Atualização do Schema Prisma:**
   - Adicionar os modelos exigidos pelo adaptador do NextAuth (`Account`, `Session`, `VerificationToken`).
   - Atualizar o modelo `User` para incluir os campos padrão (`name`, `email`, `image`) e manter o campo `role` (padrão: "PLAYER").
   - Garantir a relação de 1 para N entre `User` e `Character` (`userId` no modelo `Character`).

2. **Configuração do NextAuth:**
   - Implementar o ficheiro de rota do NextAuth (`app/api/auth/[...nextauth]/route.ts`).
   - Configurar o `DiscordProvider` com `clientId` e `clientSecret` via variáveis de ambiente.
   - Utilizar o `@auth/prisma-adapter` para persistência automática no SQLite.

---

### Fase 2: Inicialização Autônoma do Mestre (GM)
Para evitar a necessidade de semear (seed) a base de dados manualmente, o sistema automatiza a atribuição do papel de Mestre.

1. **Lógica "O Primeiro a Chegar é o Rei":**
   - Utilizar o evento `createUser` nas opções do NextAuth.
   - Quando um utilizador é criado, o sistema deve contar o número total de utilizadores no banco (`prisma.user.count()`).
   - Se o total for exatamente `1`, atualizar o `role` deste utilizador para `"GM"`.
   - Passar o `role` e o `id` do utilizador para a sessão através dos callbacks `jwt` e `session`, tornando-os disponíveis no frontend.

---

### Fase 3: Painel Admin e Criação de Fichas
Garantir que jogadores gerem as suas próprias fichas e que o GM tenha visibilidade global.

1. **Criação de Fichas (Players):**
   - Na criação de um novo `Character`, o backend deve obter a sessão ativa e injetar automaticamente o `session.user.id` no campo `userId` da ficha.
   - As listagens de fichas para jogadores comuns devem filtrar sempre por `where: { userId: session.user.id }`.

2. **Painel do Mestre (Admin):**
   - Criar uma rota protegida (ex: `app/admin/page.tsx`).
   - Utilizar `getServerSession` no topo do componente (Server Component). Se o `role` for diferente de `"GM"`, redirecionar imediatamente para a página inicial.
   - O painel deve listar todos os utilizadores e as respetivas fichas associadas (via query relacional do Prisma).

---

### Fase 4: Blueprint de Segurança (Endurecimento)
Proteções obrigatórias para mitigar riscos de segurança, especialmente malware no lado do cliente.

1. **Blindagem de Sessão:**
   - Configurar o NextAuth para gerar cookies de sessão com as flags `HttpOnly`, `Secure` e `SameSite="Lax"`.
   - Utilizar estratégias de sessão JWT com expiração renovável para limitar a janela temporal em caso de interceção.

2. **Sanitização de Dados Flexíveis (Prevenção de XSS):**
   - Como o `sheetData` e `pokemonData` são armazenados em JSON/String, e as notas em Markdown, é expressamente **proibido** usar `dangerouslySetInnerHTML` sem tratamento prévio.
   - Todo o conteúdo gerado por utilizadores deve passar por purificação (ex: `isomorphic-dompurify` ou `sanitize-html`) antes de ser renderizado no React.

3. **Operações Críticas:**
   - Ações de alteração em massa ou eliminação no painel do GM devem verificar novamente a autorização no servidor (Server Actions), validando a sessão e o papel do utilizador em cada pedido.
