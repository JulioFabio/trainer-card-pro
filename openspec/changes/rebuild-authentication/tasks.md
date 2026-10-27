# Tasks

## 1. Base: banco, senha e limitador

- [ ] 1.1 Copiar `dev.db` para `dev.db.bak`, acrescentar `passwordHash String?` ao `User` em `prisma/schema.prisma` e aplicar com `npx prisma db push`. Verificar que `npx prisma validate` passa, que o cliente foi regenerado e que as contas e fichas existentes continuam no `dev.db`.
- [ ] 1.2 Criar `src/lib/password.ts` com `hashPassword` e `verifyPassword` (scrypt, formato do design D1, comparação em tempo constante, hash falso para igualar tempo). Cobrir com testes: hash não contém a senha, duas senhas iguais geram valores diferentes, verificação certa e errada, formato inválido retorna falso. Verificar que passam.
- [ ] 1.3 Criar `src/lib/loginLimiter.ts` (design D4, relógio injetável) e testes dos cenários "Quinta falha seguida", "Fim do bloqueio" e "Sucesso zera a contagem". Verificar que passam.

## 2. Núcleo de autenticação

- [ ] 2.1 Reescrever `src/auth.ts` conforme design D3 e D7: sem `PrismaAdapter` nem `createUser`, `authorize` por nome normalizado e senha com limitador, papel lido do banco, mensagem única de falha, `AUTH_SECRET` sem valor padrão. Substituir `__tests__/unit/auth.test.ts` e `__tests__/integration/auth.test.ts` por testes dos cenários "Credenciais corretas", "Nome com caixa diferente", "Senha incorreta", "Papel enviado pelo cliente", "Nome inexistente não cria conta", "Nome inexistente e senha errada", "Senha fora dos logs" e "Variável ausente". Verificar que passam.
- [ ] 2.2 Documentar `AUTH_SECRET` como obrigatória no `.env.example` (sem valor de exemplo utilizável) e confirmar que o `.env` local a define. Verificar que `src/auth.ts` não contém mais o texto do segredo antigo (`grep development-fallback`).

## 3. Contas

- [ ] 3.1 Criar `src/lib/setupState.ts` (cadastro inicial pendente = nenhuma conta com senha) e `setupGmAction` com transação, reaproveitamento de conta antiga pelo nome normalizado (preenchendo `username`) e recusa depois de feito. Cobrir com testes os cenários "Banco sem contas com senha", "Conta antiga reaproveitada" e "Cadastro inicial já feito", e a senha curta. Verificar que passam.
- [ ] 3.2 Em `src/app/admin/actions.ts`, criar `createPlayerAction` e `resetPlayerPasswordAction`, com papel `GM` conferido no banco, validação de nome e senha, nome duplicado recusado e `username` preenchido. Cobrir os cenários "GM cria jogador", "Nome já em uso", "Jogador tenta criar conta", "Visitante tenta criar conta" e "GM redefine senha". Verificar que passam.
- [ ] 3.3 Criar `changeOwnPasswordAction` (senha atual obrigatória) e testes dos cenários "Troca bem-sucedida", "Senha atual incorreta" e "Senha curta". Verificar que passam.

## 4. Telas

- [ ] 4.1 Acrescentar ao `tailwind.config.ts` os tokens da "Configuração inicial" da skill `pokedex-ui` (`fontSize`, `borderRadius`, `boxShadow`, `colors.type`), sem alterar telas existentes. Verificar que `npm run build` gera CSS equivalente ao anterior nas telas atuais (as classes novas só entram onde forem usadas).
- [ ] 4.2 Criar `src/app/login/page.tsx` e `src/app/setup/page.tsx` (formulários cliente, visual da Pokédex conforme `DESIGN.md`, mensagens de erro genéricas e foco/teclado acessíveis). `/login` redireciona para `/` com sessão; `/setup` redireciona para `/login` quando o cadastro inicial já foi feito. Verificar com o servidor de dev que cada redirecionamento ocorre.
- [ ] 4.3 Transformar `src/app/page.tsx` em guarda no servidor (design D5): sem sessão redireciona para `/setup` ou `/login`; com sessão renderiza o `App`. Adicionar no cabeçalho do `App` os botões de sair (`signOut`) e de trocar a senha (diálogo que chama `changeOwnPasswordAction`). Verificar os cenários "Visitante na página principal" e "Logout".
- [ ] 4.4 No painel `/admin`, acrescentar o formulário de nova conta de jogador e a ação de redefinir senha na lista de usuários, usando `createPlayerAction` e `resetPlayerPasswordAction` e mostrando erros sem revelar detalhes internos. Verificar manualmente criando um jogador e entrando com ele.

## 5. Remoção do login antigo

- [ ] 5.1 Remover o formulário de login manual e as partículas associadas de `src/app/page.tsx`, o bloco de login com Discord e o import de `signIn` em `src/App.tsx`, `__tests__/unit/loginScreen.test.tsx`, `src/components/SessionProvider.tsx` e seu uso em `src/app/layout.tsx`, além de variáveis `DISCORD_*` do `.env.example`. Verificar com `grep -rn -i "discord\|SessionProvider\|useSession" src __tests__ .env.example` que nada resta e que `npm run check` passa.

## 6. Verificação integrada

- [ ] 6.1 Rodar `npm run check` e `npm run build`. Com `npm run dev`, percorrer o fluxo: `/` leva a `/setup`; criar o GM reaproveitando a conta antiga e conferir que as fichas dela aparecem; sair e entrar; criar um jogador no `/admin` e entrar com ele; errar a senha 5 vezes e confirmar o bloqueio e a mesma mensagem para nome inexistente; trocar a própria senha; confirmar que `/setup` redireciona. Registrar o resultado na tarefa e confirmar que nenhum log contém senhas.

## Workflow follow-up

- Revisar o diff e arquivar a change com `/opsx:archive` depois da revisão.
- Em seguida, propor a fase 3: `secure-api-layer`.
