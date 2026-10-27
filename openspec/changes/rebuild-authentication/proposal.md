# Proposal

## Why

O login atual não autentica ninguém e deixa qualquer pessoa virar GM: o provedor de credenciais em `src/auth.ts` aceita um nome, cria a conta se ela não existe e lê o campo `role` direto do formulário. O segredo de sessão tem um valor padrão escrito no código. O app roda exposto por túnel (`dev:all`), então isso está acessível pela internet.

O uso real é outro: uma mesa casual, em que o mestre instala o app no próprio computador e passa um link aos jogadores, como no Foundry VTT. Não faz sentido exigir contas com senha para todo mundo; o que a mesa precisa é uma tela de entrada simples (escolher o seu nome na lista), senha só quando o mestre quiser, e a garantia de que ninguém vira mestre pelo link. O mestre também precisa de um jeito fácil de recuperar o acesso, já que o software roda na máquina dele.

Esta é a fase 2 de 5 do programa de refatoração. Também prepara o app para ser distribuído compilado (GitHub Releases), numa change futura, sem exigir que o mestre edite arquivos de configuração.

## What Changes

- **BREAKING** Fim do login por nome digitado. A entrada passa a ser uma caixa de seleção com os perfis de jogador da sessão, mais o nome da sessão (campanha), e um campo de senha que só é exigido quando o mestre definiu uma senha para aquele perfil. Um jogador pode escolher o perfil de outro: a mesa é de confiança e isso é aceito de propósito.
- **O Mestre entra automaticamente** quando o app é aberto pelo próprio computador onde está instalado (acesso local direto, sem sinais de proxy ou túnel). Quem chega pelo link nunca é GM, e o papel sempre vem do banco, nunca do cliente.
- **Senha do Mestre opcional**, para entrar de outro aparelho pelo seletor. O perfil Mestre só aparece na lista quando essa senha existe. Recuperação: um arquivo `RESET_SENHA_MESTRE` colocado na pasta de dados do app, no computador do mestre, apaga a senha do Mestre na próxima inicialização.
- O mestre gerencia tudo pelo painel `/admin`: criar, renomear e remover perfis, definir ou tirar a senha de cada perfil, definir a senha do Mestre e o nome da sessão. Não existe cadastro de jogadores por conta própria nem tela de cadastro inicial.
- Senhas opcionais guardadas só como hash com salt (`scrypt`, módulo `crypto` do Node). Tentativas erradas seguidas bloqueiam o perfil por um tempo.
- **Banco zerado:** as contas, sessões, fichas e demais dados antigos do `dev.db` são apagados (com backup antes) e o app começa do zero. Um script de desenvolvimento (`npm run seed:dev`) cria perfis de teste no banco limpo; ele não faz parte da versão distribuída.
- `AUTH_SECRET` deixa de ter valor padrão fixo: se a variável não existir, o app gera um segredo aleatório por instalação e o guarda num arquivo local (ignorado pelo git). Assim a versão instalável não depende de editar `.env`.
- Remover o login antigo: formulário manual em `src/app/page.tsx`, botão de Discord e "Dev Login" em `src/App.tsx`, `PrismaAdapter` e evento `createUser` do `src/auth.ts`, `SessionProvider` e `loginScreen.test.tsx`.
- Esquema do banco: `User.passwordHash` (opcional) e uma tabela `AppSetting` para o nome da sessão.

Fora de escopo: empacotar e publicar o app compilado (change própria, depois desta), autorização por dono nas rotas de API (fase 3), reestruturação das fichas (fase 4), divisão do `App.tsx` (fase 5), login social e recuperação por e-mail. As tabelas `Account`, `Session` e `VerificationToken` ficam como estão; a limpeza delas é da fase 4.

## Capabilities

### New Capabilities

- `authentication`: como cada pessoa entra na sessão (seleção de perfil com senha opcional, mestre local automático), como os perfis e senhas são geridos pelo mestre, como a sessão é aberta e encerrada, e quais proteções existem contra uso indevido.

### Modified Capabilities

(nenhuma; as specs `observability` e `project-structure` não mudam)

## Impact

- **Código:** `src/auth.ts` (reescrito, dois provedores), `src/app/page.tsx` (guarda no servidor), novas páginas `src/app/login`, ações de servidor e interface em `src/app/admin`, novos módulos em `src/lib` (senha, limitador, segredo, detecção de acesso local, perfis), `src/instrumentation.ts` (leitura do arquivo de reset na inicialização), `src/App.tsx` (remove o bloco de login, adiciona o botão de sair), `tailwind.config.ts` (tokens do `DESIGN.md`).
- **Banco:** `prisma/schema.prisma` ganha `User.passwordHash` e `AppSetting`; o `dev.db` é zerado com `prisma db push --force-reset` depois do backup `dev.db.bak`. **Todas as fichas e contas atuais são perdidas**, por decisão do mestre.
- **Operação:** `AUTH_SECRET` passa a ser opcional (gerada se faltar). Novos arquivos locais ignorados pelo git: `.auth-secret` e `RESET_SENHA_MESTRE`. Sessões atuais deixam de valer.
- **Testes:** novos testes de senha, limitador, segredo, acesso local, login por perfil, entrada do Mestre, gestão de perfis e reset; `loginScreen.test.tsx` e os testes antigos de `auth` são removidos ou reescritos.
- **Dependências:** nenhuma nova. O script de seed roda TypeScript direto no Node 24.
