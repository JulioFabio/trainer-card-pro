# Tasks

## 1. Base: banco limpo e módulos de segurança

- [ ] 1.1 Copiar `dev.db` para `dev.db.bak`, acrescentar `User.passwordHash String?` e o modelo `AppSetting { key String @id, value String }` em `prisma/schema.prisma` e aplicar com `npx prisma db push --force-reset`. Verificar que `npx prisma validate` passa, que o cliente foi regenerado e que as tabelas `User`, `Character` e demais estão vazias (contagem 0).
- [ ] 1.2 Criar `src/lib/password.ts` (`hashPassword`, `verifyPassword`, mínimo de 4 caracteres exposto como constante) conforme design D4. Testes: o hash não contém a senha, a mesma senha gera valores diferentes, verificação certa e errada, formato inválido retorna falso. Verificar que passam.
- [ ] 1.3 Criar `src/lib/loginLimiter.ts` (design D5, relógio injetável) e testes dos cenários "Quinta falha seguida", "Fim do bloqueio" e "Sucesso zera a contagem". Verificar que passam.
- [ ] 1.4 Criar `src/lib/localRequest.ts` (`isLocalRequest`, design D2) e testes dos cenários "Mestre abre o app no próprio computador", "Acesso pelo link do túnel", "Host falsificado atrás do túnel" e "Acesso pela rede local", incluindo `[::1]` e cada cabeçalho de proxy. Verificar que passam.
- [ ] 1.5 Criar `src/lib/authSecret.ts` (design D6) e testes dos cenários "Variável definida", "Primeira execução sem variável", "Execuções seguintes" e "Instalações diferentes", usando uma pasta temporária e sem criar arquivo durante o build. Acrescentar `.auth-secret` e `RESET_SENHA_MESTRE` ao `.gitignore`. Verificar que passam.

## 2. Núcleo de autenticação

- [ ] 2.1 Reescrever `src/auth.ts` conforme design D1: provedores `profile` e `local-gm`, sem `PrismaAdapter` nem `createUser`, papel sempre lido do banco, segredo de `authSecret`. Substituir `__tests__/unit/auth.test.ts` e `__tests__/integration/auth.test.ts` por testes dos cenários "Perfil sem senha", "Perfil com senha e senha correta", "Perfil com senha e senha incorreta", "Papel enviado pelo cliente", "Perfil inexistente", "Escolha do perfil de outro jogador", "Senha fora dos logs" e da entrada `local-gm` (local entra como GM; túnel não). Verificar que passam.
- [ ] 2.2 Criar `src/lib/masterReset.ts` (`applyMasterPasswordReset`) e `src/instrumentation.ts` que a chama na inicialização do servidor Node (design D7). Testes dos cenários "Arquivo de reset presente" e "Arquivo ausente", incluindo o log sem senhas. Verificar que passam.
- [ ] 2.3 Tornar `AUTH_SECRET` opcional e remover as variáveis `DISCORD_*` do `.env.example`, explicando que `AUTH_SECRET` é opcional e que a pasta de dados pode ser definida em `APP_DATA_DIR`. Verificar que `src/auth.ts` não contém mais o texto do segredo antigo (`grep development-fallback`).

## 3. Perfis e configurações

- [ ] 3.1 Criar `src/lib/profiles.ts` com `listLoginProfiles()` (nome, identificador e `requiresPassword`, sem hash; inclui o Mestre apenas se ele tiver senha) e `getSessionName()` (padrão "Minha Mesa"). Testes dos cenários "Lista e nome da sessão", "Sem perfis" e "Sem senha do Mestre", e que o resultado não contém `passwordHash`. Verificar que passam.
- [ ] 3.2 Em `src/app/admin/actions.ts`, criar `createProfileAction`, `renameProfileAction`, `removeProfileAction` e `setProfilePasswordAction` (design D9), com papel `GM` conferido no banco, nome único normalizado e senha mínima. Testes dos cenários "Mestre cria perfil", "Nome já em uso", "Jogador tenta gerir perfis", "Visitante tenta gerir perfis", "Remoção de perfil" e "Senha curta". Verificar que passam.
- [ ] 3.3 Criar `setMasterPasswordAction` e `setSessionNameAction` no mesmo arquivo e testes dos cenários "Nome da sessão", "Entrada do Mestre por outro aparelho" e "Senha do Mestre incorreta" (via `profile`). Verificar que passam.

## 4. Telas

- [ ] 4.1 Acrescentar ao `tailwind.config.ts` os tokens da "Configuração inicial" da skill `pokedex-ui` (`fontSize`, `borderRadius`, `boxShadow`, `colors.type`), sem alterar telas existentes. Verificar que `npm run build` gera CSS equivalente ao anterior nas telas atuais (as classes novas só entram onde forem usadas).
- [ ] 4.2 Criar `src/app/login/page.tsx` (design D8): nome da sessão, caixa de seleção de perfis, campo de senha que aparece só para perfil com senha, mensagem de senha incorreta, estado "Mestre ainda não criou perfis" e a entrada automática do Mestre quando `isLocalRequest` for verdadeiro. Visual da Pokédex conforme `DESIGN.md`, acessível por teclado. Verificar com o servidor de dev cada um desses estados.
- [ ] 4.3 Transformar `src/app/page.tsx` em guarda no servidor (sem sessão redireciona para `/login`) e adicionar o botão de sair ao cabeçalho do `App`. Verificar os cenários "Visitante na página principal" e "Logout".
- [ ] 4.4 No `/admin`, acrescentar a gestão de perfis (criar, renomear, remover com confirmação que avisa que a ficha também será apagada, definir ou remover senha), o campo do nome da sessão e a senha do Mestre, usando as ações das tarefas 3.2 e 3.3. Verificar manualmente cada operação.

## 5. Remoção do login antigo

- [ ] 5.1 Remover o formulário de login manual de `src/app/page.tsx`, o bloco de login com Discord e o import de `signIn` em `src/App.tsx`, `__tests__/unit/loginScreen.test.tsx`, `src/components/SessionProvider.tsx` e seu uso em `src/app/layout.tsx`. Verificar com `grep -rn -i "discord\|SessionProvider\|useSession" src __tests__ .env.example` que nada resta e que `npm run check` passa.

## 6. Seed de desenvolvimento

- [ ] 6.1 Criar `scripts/seed-dev.ts` (design D10) e o script `seed:dev` no `package.json`. Verificar que, no banco limpo, `npm run seed:dev` cria "Túlio", "Robert" e "Black" e define o nome da sessão como "Mesa de Teste", e que rodar de novo não duplica nada.

## 7. Verificação integrada

- [ ] 7.1 Rodar `npm run check` e `npm run build`. Com `npm run dev` e o seed aplicado: abrir `http://localhost:3000` e confirmar que entra direto como GM; chamar a página de login com cabeçalhos de túnel (`curl -H "x-forwarded-for: 1.2.3.4" -H "Host: localhost:3000"`) e confirmar que NÃO vira GM; entrar como Túlio sem senha; definir senha para Robert no `/admin` e confirmar que ela passa a ser exigida; errar 5 vezes e ver o bloqueio; definir a senha do Mestre e entrar como Mestre pelo seletor; criar `RESET_SENHA_MESTRE`, reiniciar e confirmar que o Mestre some da lista; apagar um perfil e ver a ficha ir junto. Confirmar que o `.auth-secret` é criado, que `next start` também aplica o reset e que nenhum log contém senhas. Registrar o resultado na tarefa.

## Workflow follow-up

- Revisar o diff e arquivar a change com `/opsx:archive` depois da revisão.
- Em seguida, propor a change de empacotamento e publicação (`package-release`) e depois a fase 3, `secure-api-layer`, reavaliando a autorização por dono (ver Open Questions do design).
