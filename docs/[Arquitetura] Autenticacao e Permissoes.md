---
tags: [documentacao-viva, projeto, autenticacao, seguranca, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-07-04
autor: "Antigravity"
---

# 🛡️ Sistema de Autenticação e Segurança (Fases 1, 2, 3 & 4)

> Especificação e documentação da infraestrutura de autenticação do [[Trainer Card Pro]], utilizando NextAuth.js (Auth.js) v5, adaptador do Prisma, provedor Discord, e blindagem de segurança XSS e Server Actions.

---

## 🏗️ Fluxo e Design

Para simplificar a gestão de contas e evitar armazenamento de senhas locais (o que implicaria riscos de segurança adicionais), o sistema delega a autenticação exclusivamente para o **Discord** utilizando o protocolo OAuth2.

O NextAuth está integrado ao banco de dados SQLite local utilizando o `@auth/prisma-adapter`. Sempre que um usuário faz login pela primeira vez, uma conta correspondente no banco é criada automaticamente, contendo as informações públicas de perfil (nome, email, avatar).

---

## 👑 Inicialização Autônoma do Mestre (Fase 2)

Para eliminar a necessidade de scripts de semeadura manual (seed), o sistema implementa a lógica **"O Primeiro a Chegar é o Rei"**:
1. **Gatilho de Criação**: O evento `createUser` é registrado nas opções do NextAuth.
2. **Auto-atribuição de Mestre**: Ao persistir o primeiro usuário, uma verificação conta o total de usuários registrados (`prisma.user.count()`). Se for exatamente `1`, atualiza seu cargo para `"GM"`. Todos os usuários subsequentes receberão o cargo padrão `"PLAYER"`.
3. **Propagação Segura de Claims**: O `id` e o `role` do usuário são propagados de forma híbrida através dos callbacks `jwt` (estratégia JWT) e `session` (estratégia Database), tornando-os disponíveis no front-end.

---

## ⚔️ Controle de Acesso e Painel do Mestre (Fase 3)

Garante que os jogadores gerenciem apenas suas próprias fichas e que o Mestre (GM) tenha controle global sobre a campanha:

1. **Injeção de ID e Proteção de CRUD (`/api/character`)**:
   - **POST**: O backend lê a sessão ativa no servidor (`auth()`) e injeta automaticamente o `session.user.id` no campo `userId` do personagem recém-criado, impedindo que jogadores forjem dados ou criem fichas sob a titularidade de outros usuários.
   - **GET**: Se fornecido um `id` de personagem, valida se o usuário solicitante é o proprietário da ficha ou é um GM. Caso não seja informado um `id`, o endpoint retorna exclusivamente as fichas vinculadas ao jogador autenticado.
   - **PUT**: Valida no banco de dados se o solicitante é dono do personagem ou GM antes de aplicar atualizações.

2. **Painel do Mestre (GM Dashboard - `/admin`)**:
   - Rota Server Component protegida contra acessos não autorizados. Se o usuário logado não possuir papel `"GM"`, ocorre redirecionamento imediato para a rota raiz `/`.
   - Consulta o banco de dados usando Prisma de forma relacional para buscar todos os usuários e suas fichas associadas (dados de nível, pokémons, itens e notas de diário) e renderiza as estatísticas em uma interface com design premium.

---

## 🔒 Blueprint de Segurança e Blindagem (Fase 4)

Proteções implementadas para conter explorações maliciosas no cliente e garantir resiliência e integridade das operações:

1. **Blindagem de Sessão (Cookies Seguros & Expiração JWT)**:
   - NextAuth configurado para utilizar a estratégia de sessão `"jwt"`.
   - Cookies configurados com flags de segurança estritas: `HttpOnly: true` (evita leitura de tokens via Javascript malicioso/XSS), `SameSite: "lax"` (mitiga CSRF) e `Secure: true` (exigido e ativado em produção).
   - Tempo de expiração da sessão definido para uma janela curta de **3 horas** (`maxAge: 3 * 60 * 60`), com atualização automática a cada **15 minutos** se houver atividade (`updateAge: 15 * 60`).

2. **Sanitização contra Cross-Site Scripting (XSS)**:
   - Integração da biblioteca `dompurify` carregada dinamicamente via `import()` assíncrono dentro de um hook `useEffect` no componente cliente `NotesTab.tsx`.
   - Isso evita erros de compilação `"window is not defined"` no SSR do Next.js e purifica todo o conteúdo Markdown de anotações inserido pelos usuários antes de passar pelo parser `ReactMarkdown`.
   - Uso de `dangerouslySetInnerHTML` é expressamente proibido para dados oriundos do banco de dados (ficha, golpes e diário) sem sanitização prévia.

3. **Validação Redundante em Server Actions**:
   - Ação de exclusão crítica de fichas (`deleteCharacterAction` em `app/admin/actions.ts`) é implementada via Server Actions.
   - Ela re-verifica a validade da sessão no servidor e faz uma busca ativa direta no banco SQLite para assegurar que a propriedade `role` do usuário executor é de fato `"GM"`, mitigando roubos de cookies ou ataques de escalada de privilégios.

---

## 💻 Arquitetura de Código

A estrutura de autenticação e segurança está dividida nos seguintes arquivos:

- **Configuração Centralizada ([auth.ts](file:///c:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/auth.ts))**: Inicializa o `NextAuth` com PrismaAdapter, DiscordProvider, estratégia JWT, cookies blindados e callbacks de claims.
- **Route Handler ([app/api/auth/[...nextauth]/route.ts](file:///c:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/api/auth/[...nextauth]/route.ts))**: Expõe endpoints HTTP `GET` e `POST`.
- **GM Dashboard ([app/admin/page.tsx](file:///c:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/admin/page.tsx))**: Visualização relacional e administrativa para mestres.
- **Server Actions ([app/admin/actions.ts](file:///c:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/admin/actions.ts))**: Ações protegidas por banco de dados executadas no servidor.
- **Sanitizador MD ([components/NotesTab.tsx](file:///c:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/NotesTab.tsx))**: Limpeza e renderização segura de anotações.

---

## 🏷️ Tags
#autenticacao #seguranca #nextauth #authjs #discord #oauth2 #sessao #jwt #cookies #xss #dompurify #server-actions #gm-dashboard #prisma
