# Design

## Context

Estado observado em 27/10/2026 (ver `proposal.md` para a motivação):

- **`src/auth.ts`:** NextAuth v5 (beta.31) com `PrismaAdapter`, um provedor `Credentials` que cria ou promove a conta a partir de `username`, `email` e `role` vindos do cliente, sessão JWT de 3 h, cookie `httpOnly`, o evento `createUser` ("primeiro usuário vira GM") e `trustHost: true`, necessário por causa do túnel. O segredo cai num valor fixo se `AUTH_SECRET` faltar.
- **Telas:** `src/app/page.tsx` é um componente cliente que decide entre a tela de login manual e o `App` com `useSession`. `src/App.tsx` (~linha 505) tem um bloco de login com botão de Discord e `signIn()` que a guarda de `page.tsx` torna inalcançável. `SessionProvider` envolve o layout.
- **Banco:** `User` tem `name`, `email` (único), `username` (único, opcional, sem uso), `role` e as relações do adaptador. Não há `passwordHash`. O projeto não usa migrations do Prisma (não existe `prisma/migrations`): o esquema é aplicado com `prisma db push`. O `dev.db` guarda contas e fichas criadas pelo login antigo, que o mestre decidiu descartar.
- **Execução:** `dev:all` sobe o Next e um túnel (`localtunnel`), que encaminha as requisições para `localhost:3000`. Isso torna insuficiente testar só o endereço de origem: pelo túnel, a conexão também chega de `127.0.0.1`.
- **Node:** v24, que executa TypeScript direto (remoção de tipos), desde que os imports usem a extensão `.ts` e não usem o alias `@/`.
- **Autorização atual:** `deleteCharacterAction` confere o papel no banco a cada chamada, padrão a seguir. As rotas de API só checam se há sessão (fase 3).

## Goals / Non-Goals

**Goals:**
- Ninguém vira GM pelo link, e o papel nunca vem do cliente.
- Entrada simples para a mesa: escolher o nome, senha só se o mestre quiser.
- O mestre sempre consegue entrar e recuperar acesso estando no computador onde o app está instalado.
- Servir de base para a versão compilada: nada de editar `.env` à mão.
- Cenários da spec cobertos por testes automatizados.

**Non-Goals:**
- Impedir que um jogador escolha o perfil de outro (confiança entre jogadores é decisão do mestre).
- Empacotamento, instalador e GitHub Releases (change própria).
- Autorização das rotas de API (fase 3) e remoção das tabelas do adaptador (fase 4).
- Limite de tentativas que sobreviva a reinício ou distribuído: o app roda em um único processo.

## Decisions

### D1. Dois provedores `Credentials`, sem adaptador
`src/auth.ts` passa a ter dois provedores, ambos devolvendo `{ id, name, role }` lidos do banco, com sessão JWT de 3 h:
- `profile`: recebe `profileId` e `password`. Busca o perfil, aplica o limitador, verifica a senha só se o perfil tiver uma, e devolve a identidade. Ignora qualquer outro campo, inclusive `role`.
- `local-gm`: sem campos. Usa o segundo argumento de `authorize(credentials, request)` para chamar `isLocalRequest(request.headers)`; se for acesso local, devolve o usuário GM (criado na primeira vez), senão `null`.
Remove `PrismaAdapter` e o evento `createUser`: com JWT e credenciais, o adaptador só servia para a regra do "primeiro usuário". O cookie, os 3 h e `trustHost` continuam.
- *Alternativa:* um só provedor com um campo "modo". Mistura duas políticas de confiança no mesmo caminho; descartado.

### D2. Detecção de acesso local em `src/lib/localRequest.ts`
`isLocalRequest(headers)` é verdadeiro quando o `host` (sem porta) é `localhost`, `127.0.0.1` ou `[::1]` **e** nenhum destes cabeçalhos está presente: `x-forwarded-for`, `x-forwarded-host`, `forwarded`, `x-real-ip`, `cf-connecting-ip`, `via`. Pelo túnel o `Host` é o do túnel e os proxies acrescentam `x-forwarded-for`/`cf-*`; uma requisição que tente falsificar `Host: localhost` ainda carrega os cabeçalhos do proxy. Acesso pelo IP da rede local (`192.168.x.x`) tem `Host` diferente e vira jogador.
- Limite conhecido: a garantia depende de o proxy do túnel acrescentar seus cabeçalhos, o que `localtunnel` e `cloudflared` fazem. Um proxy reverso que os remova quebraria a regra. Registrado em Riscos e verificado na tarefa final.
- *Alternativa:* endereço de origem da conexão. Pelo túnel a conexão chega de `127.0.0.1`, então não distingue o mestre; descartado.
- *Alternativa:* cookie ou chave secreta entregue só na máquina local. Mais forte, mas pede um passo manual a mais para o mestre; ficaria como evolução.

### D3. Esquema: perfis, senha opcional e configurações
- `User.passwordHash String?`: nulo significa "sem senha". `User.username` (já único) guarda o nome normalizado (`trim` + minúsculas) para a unicidade; `name` guarda o texto como o mestre digitou. `email` deixa de ser usado.
- O GM é uma linha de `User` com `role = "GM"` e `name = "Mestre"`, criada na primeira entrada local. Sua `passwordHash` é a senha do Mestre. Só existe um GM.
- Nova tabela `AppSetting { key String @id, value String }`, com a chave `sessionName`. Valor padrão exibido quando ausente: "Minha Mesa".
- Banco zerado com `prisma db push --force-reset` depois de `dev.db.bak`. Isso apaga também as linhas das tabelas de adaptador e o restante dos dados antigos.

### D4. Senhas com `scrypt`
`src/lib/password.ts`: formato `scrypt$<N>$<salt-base64>$<hash-base64>`, salt de 16 bytes, chave de 64 bytes, `timingSafeEqual`. Os parâmetros ficam no valor, então podem subir depois sem invalidar senhas antigas. A senha tem mínimo de 4 caracteres, escolha deliberada para uma mesa casual. Sem dependência nova.

### D5. Limitador em memória, por perfil
`src/lib/loginLimiter.ts`: um `Map` por `id` de perfil com contagem e início da janela; 5 falhas em 15 min bloqueiam por 15 min; sucesso apaga a entrada; relógio injetável nos testes. Chave por perfil porque atrás do túnel o IP não é confiável. Consequência aceita: quem errar a senha de propósito trava aquele perfil por 15 min.

### D6. Segredo por instalação em `src/lib/authSecret.ts`
Ordem: `AUTH_SECRET` do ambiente; senão o arquivo `.auth-secret` na pasta de dados; senão gera 32 bytes aleatórios, grava o arquivo (modo `0600`) e usa. A pasta de dados é `process.env.APP_DATA_DIR` ou a raiz do projeto (onde já está o `dev.db`). Durante `next build` (`NEXT_PHASE=phase-production-build`) não cria arquivo, para que um build distribuível nunca embuta um segredo. Os arquivos `.auth-secret` e `RESET_SENHA_MESTRE` entram no `.gitignore`.

### D7. Reset da senha do Mestre em `src/instrumentation.ts`
O hook `register()` do Next roda uma vez na inicialização do servidor. Ele chama `applyMasterPasswordReset()` (`src/lib/masterReset.ts`): se `RESET_SENHA_MESTRE` existe na pasta de dados, zera `passwordHash` do GM, apaga o arquivo e registra `logger.warn`. A lógica fica numa função pura e testável; o `register()` só a chama no runtime Node.
- *Alternativa:* checar o arquivo a cada tentativa de entrada. Evita reiniciar, mas custa um acesso a disco por tentativa; reiniciar o app é aceitável aqui.

### D8. Telas e guarda no servidor
- `src/app/page.tsx` vira componente de servidor: com sessão renderiza o `App`; sem sessão redireciona para `/login`.
- `/login` (servidor + formulário cliente): carrega o nome da sessão e a lista de perfis (nome, identificador e se exige senha) por consulta direta ao banco, sem endpoint público de listagem e sem expor o hash. Se `isLocalRequest` for verdadeiro, mostra um componente que chama `signIn('local-gm')` sozinho; senão mostra o seletor, o campo de senha (só aparece para perfil com senha) e o perfil Mestre apenas se houver senha do Mestre. O `local-gm` revalida o acesso no servidor, então o cliente não pode forçá-lo.
- `/admin` ganha: lista de perfis (criar, renomear, remover com confirmação, definir/remover senha), campo do nome da sessão e senha do Mestre.
- Logout: botão no cabeçalho do `App` chamando `signOut` de `next-auth/react`, que dispensa o `SessionProvider` (removido).

### D9. Ações de servidor para gestão
`createProfileAction`, `renameProfileAction`, `removeProfileAction`, `setProfilePasswordAction` (senha vazia remove), `setMasterPasswordAction` e `setSessionNameAction` em `src/app/admin/actions.ts`. Todas conferem `role === "GM"` no banco a cada chamada (mesmo padrão de `deleteCharacterAction`), validam o nome (1–40 caracteres) e a senha (mínimo de 4), registram quem fez o quê pelo `logger` e nunca registram senhas. Remover um perfil apaga as fichas dele por cascata do esquema; a interface pede confirmação.

### D10. Seed de desenvolvimento
`scripts/seed-dev.ts` (rodado com `node scripts/seed-dev.ts`, via `npm run seed:dev`) cria "Túlio", "Robert" e "Black" no banco limpo, com o nome da sessão "Mesa de Teste". Importa só `src/lib/password.ts` por caminho relativo com extensão `.ts`, sem o alias, e usa o cliente do Prisma direto. Não é chamado por nada do app e não entra na versão distribuída.

### D11. Telas seguem o `DESIGN.md`
As telas novas usam os papéis tipográficos, raios e sombras do `DESIGN.md`, preservando a estética Pokédex (carcaça colorida, contorno preto, sombra dura, lente ciano). Para isso o `tailwind.config.ts` recebe os tokens da "Configuração inicial" da skill `pokedex-ui` (`fontSize`, `borderRadius`, `boxShadow`, `colors.type`). A adição não muda nenhuma tela existente.

## Risks / Trade-offs

- [O túnel ou um proxy futuro não acrescenta cabeçalhos e um visitante remoto passa por "local"] → A regra exige `Host` local **e** ausência de cabeçalhos de proxy; a tarefa final simula as duas situações. Se algum dia o app rodar atrás de um proxy que os remova, trocar por chave local (alternativa de D2).
- [Qualquer jogador entra como qualquer outro, inclusive apagando a ficha de um colega] → Aceito pela mesa. Os dados mais sensíveis (perfil Mestre e painel) continuam protegidos. A fase 3 deve reavaliar "autorização por dono": neste modelo ela só protege contra acidente, não contra má-fé, e pode ser simplificada.
- [Zerar o banco apaga todas as fichas atuais] → Decisão explícita do mestre; backup em `dev.db.bak` antes (fora do git).
- [Mestre esquece a senha do Mestre] → Recuperação pelo arquivo `RESET_SENHA_MESTRE` e reinício (D7). O acesso pelo próprio computador nunca depende dessa senha.
- [Bloqueio por perfil permite travar a entrada de alguém por 15 min] → Aceito (D5).
- [Segredo gerado em arquivo: copiar a pasta para outro computador carrega o segredo] → Sem consequência prática: o segredo só assina sessões; apagar `.auth-secret` gera outro e encerra as sessões.
- [Beta do NextAuth] → Versão fixada no `package-lock.json`; a lógica própria fica em funções puras (`localRequest`, `password`, `loginLimiter`) testadas sem o framework.
- [`instrumentation.ts` não roda em algum modo de execução] → Verificado na tarefa final com `next dev` e `next start`.

## Migration Plan

1. Copiar `dev.db` para `dev.db.bak`; atualizar `prisma/schema.prisma`; aplicar com `prisma db push --force-reset` (o banco fica vazio).
2. Em desenvolvimento, `npm run seed:dev` cria os perfis de teste.
3. Abrir o app pelo computador do mestre: ele entra como GM, define o nome da sessão e cria os perfis (ou usa o seed) e, se quiser, senhas por perfil e a senha do Mestre.
4. Passar o link aos jogadores.

Rollback: reverter os commits e restaurar `dev.db.bak`.

## Open Questions

- Para a fase 3: manter alguma autorização por dono nas rotas de ficha ou deixar só "tem sessão" e "é GM"? Depende de a mesa querer proteção contra acidente.
- Para a change de empacotamento: onde fica a pasta de dados da versão instalada (`APP_DATA_DIR`) e como o instalador a cria.
