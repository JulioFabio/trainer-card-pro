# Design

## Context

Estado observado em 27/10/2026 (ver `proposal.md` para a motivação):

- **`src/auth.ts`:** NextAuth v5 (beta.31) com `PrismaAdapter`, um provedor `Credentials` que cria ou promove a conta com base em `username`, `email` e `role` vindos do cliente, sessão JWT de 3 h, cookie `httpOnly` e o evento `createUser` que dá `GM` ao primeiro usuário. O segredo cai num valor fixo se `AUTH_SECRET` faltar. `trustHost: true` é necessário por causa do túnel.
- **Telas:** `src/app/page.tsx` é um componente cliente que decide entre a tela de login manual e o `App` com `useSession`. `src/App.tsx` (~linha 505) ainda tem um bloco de login com botão de Discord e `signIn()` que a guarda de `page.tsx` torna inalcançável. `SessionProvider` envolve o layout.
- **Banco:** `User` tem `name`, `email` (único), `username` (único, opcional, hoje sem uso), `role` e relações do adaptador (`Account`, `Session`, `VerificationToken`). Não há `passwordHash`. O projeto não usa migrations do Prisma (não existe `prisma/migrations`), então o esquema é aplicado com `prisma db push`. O `dev.db` já tem contas criadas pelo login antigo, sem senha.
- **Autorização atual:** `deleteCharacterAction` confere o papel no banco a cada chamada, o que é o padrão a seguir. As rotas de API só checam se há sessão (a autorização por dono/GM é a fase 3).
- **Dependências:** nenhuma biblioteca de hash instalada. Módulos nativos como `bcrypt`/`argon2` exigem compilação no Windows.

## Goals / Non-Goals

**Goals:**
- Identidade confiável: sem senha correta não há sessão, e o papel nunca vem do cliente.
- Nenhum cadastro público, nem na janela entre a instalação e a criação do GM, além do `/setup`.
- Código de autenticação testável sem navegador, com os cenários da spec cobertos por testes.

**Non-Goals:**
- Autorização das rotas de API (fase 3) e remoção das tabelas do adaptador (fase 4).
- Recuperação de senha por e-mail e login social.
- Revogar sessões já emitidas quando a senha muda: elas expiram em até 3 h.
- Limite de tentativas distribuído: o app roda em um único processo.

## Decisions

### D1. Hash com `scrypt` do módulo `crypto`
Formato guardado: `scrypt$<N>$<salt-base64>$<hash-base64>`, com salt de 16 bytes, chave de 64 bytes e `timingSafeEqual` na comparação. Os parâmetros ficam no próprio valor, então podem subir depois sem invalidar as senhas antigas. Quando o nome não existe, o login compara contra um hash fixo falso para igualar o tempo de resposta.
- *Alternativa:* `bcryptjs` (JS puro). Funciona, mas é uma dependência a mais para um problema que o Node já resolve.
- *Alternativa:* `argon2`/`bcrypt` nativos. Exigem compilação no Windows; descartado.

### D2. Esquema: `passwordHash` e `username` normalizado
`User.passwordHash String?`. O `username` (já único) passa a guardar o nome de login normalizado (`trim` + minúsculas), e o `name` guarda o texto como o GM digitou, para exibição. Contas antigas têm `username` nulo e não têm senha, então não conseguem entrar; o `username` delas é preenchido quando ganham senha (no `/setup` ou na redefinição pelo GM), sem script de backfill. Se dois nomes antigos colidirem depois de normalizados, a operação falha com mensagem clara e o GM resolve renomeando um deles.
- *Alternativa:* login por `email`. Os jogadores não têm e-mail real hoje (o login antigo inventava `@campaign.local`).

### D3. NextAuth sem adaptador, só `Credentials` + JWT
Remove o `PrismaAdapter` e o evento `createUser`: com sessão JWT e um único provedor de credenciais, o adaptador não faz nada além de gerar as regras de "primeiro usuário". `authorize` normaliza o nome, consulta o limitador, busca a conta, verifica a senha e devolve `{ id, name, role }` lido do banco. O callback `jwt` copia `id` e `role` apenas no login; o callback `session` os expõe. O cookie, os 3 h e o `trustHost` continuam como estão.

### D4. Limitador de tentativas em memória
Um `Map` por nome normalizado com contagem e instante da primeira falha da janela: 5 falhas em 15 min bloqueiam por 15 min; sucesso apaga a entrada; entradas vencidas são removidas ao consultar. Fica em `src/lib/loginLimiter.ts`, com relógio injetável para os testes. Chave por nome (não por IP), porque atrás do túnel o IP de origem não é confiável.
- Consequência: um atacante pode bloquear o login de um jogador por 15 min digitando senhas erradas para o nome dele. Numa mesa pequena isso é aceito; o GM não fica trancado para sempre.
- *Alternativa:* tabela no banco. Sobrevive a reinício, mas adiciona escrita a cada login falho; desnecessário aqui.

### D5. Guarda no servidor e telas separadas
`src/app/page.tsx` vira componente de servidor: chama `auth()`; sem sessão, redireciona para `/setup` (se nenhuma conta tem senha) ou `/login`; com sessão, renderiza o `App`. `/login` e `/setup` são páginas com formulário cliente; `/login` redireciona para `/` se já houver sessão, e `/setup` redireciona para `/login` quando o cadastro inicial já foi feito. "Cadastro inicial pendente" é `count(User com passwordHash) === 0`, calculado em `src/lib/setupState.ts`.

### D6. Ações de servidor para contas
- `setupGmAction` (público, mas só funciona enquanto o cadastro inicial está pendente; faz a checagem e a escrita numa transação para duas requisições simultâneas não criarem dois GMs).
- `createPlayerAction`, `resetPlayerPasswordAction` em `src/app/admin/actions.ts`, ambas conferindo o papel `GM` no banco a cada chamada (mesmo padrão de `deleteCharacterAction`).
- `changeOwnPasswordAction`, para qualquer usuário autenticado, exigindo a senha atual.
Todas validam a entrada (nome 2–40 caracteres, senha ≥ 8), registram só o que aconteceu e quem fez (nunca a senha) e usam o `logger`.

### D7. `AUTH_SECRET` obrigatória
Sem valor padrão. `authorize` checa a variável e, se ausente, registra `logger.error` e devolve `null`; a configuração do Auth.js passa o segredo sem fallback, então o Auth.js também recusa a requisição. Não lança exceção na importação para não quebrar o `next build`.

### D8. Limpeza do login antigo
Remove o formulário manual de `page.tsx`, o bloco de login e o import de `signIn` em `App.tsx`, `loginScreen.test.tsx`, o botão de Discord e o `SessionProvider` (o logout usa `signOut` de `next-auth/react`, que dispensa o provedor). O `App` ganha um botão de sair e de trocar senha no cabeçalho, com mudança mínima.

### D9. Telas novas seguem o `DESIGN.md`
As telas `/login`, `/setup`, o formulário do admin e o diálogo de troca de senha usam os papéis tipográficos, raios e sombras do `DESIGN.md`, preservando a estética Pokédex (carcaça colorida, contorno preto, sombra dura, lente ciano). Para isso, o `tailwind.config.ts` recebe os tokens da "Configuração inicial" da skill `pokedex-ui` (`fontSize`, `borderRadius`, `boxShadow`, `colors.type`). A adição é aditiva e não muda nenhuma tela existente.

## Risks / Trade-offs

- [GM esquece a senha e fica trancado: `/setup` já está fechado] → Fora do escopo deste change, mas registrado: a saída é editar o banco (`passwordHash` nulo e outro GM) ou criar um segundo GM antes. Uma recuperação por linha de comando pode virar uma change própria.
- [Contas antigas ficam sem acesso até o GM redefinir a senha] → Esperado e comunicado na tarefa de verificação; as fichas não são tocadas.
- [`prisma db push` altera o `dev.db` real] → Copiar `dev.db` para um backup antes; a mudança é só uma coluna anônima nova e nula.
- [Bloqueio por nome permite negar o login de um jogador] → Aceito (D4); expira em 15 min.
- [Sessão antiga continua válida após troca de senha] → Aceito (Non-Goal); expira em até 3 h.
- [Rotas de API ainda só checam "há sessão"] → Coberto pela fase 3; esta change não piora a situação e fecha a entrada principal.
- [Beta do NextAuth muda a API] → A versão está fixada no `package-lock.json`; os testes de `authorize` isolam a lógica própria do framework.

## Migration Plan

1. Copiar `dev.db` para `dev.db.bak` (fora do git, já ignorado) e rodar `prisma db push` com o esquema novo.
2. Subir o app: como nenhuma conta tem senha, `/` leva a `/setup`. O GM entra com o nome da conta antiga (preserva as fichas) e define a senha.
3. O GM cria ou redefine as contas dos jogadores pelo painel e repassa as senhas.

Rollback: reverter os commits e restaurar o `dev.db.bak`; a coluna `passwordHash` é inofensiva se ficar.

## Open Questions

- Recuperação de senha do GM por linha de comando (ver Riscos): fica para uma change futura se a mesa quiser.
