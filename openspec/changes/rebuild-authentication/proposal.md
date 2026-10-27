# Proposal

## Why

O login atual não autentica ninguém. O provedor de credenciais em `src/auth.ts` aceita só um nome de treinador: quem digitar o nome de outro jogador entra na conta dele, e o campo `role` vem do formulário, então qualquer pessoa pode se declarar GM. Se o nome não existe, a conta é criada na hora. O segredo de sessão tem um valor padrão escrito no código, usado quando `AUTH_SECRET` não está definido. O app roda exposto por túnel (`dev:all`), então essas falhas estão acessíveis pela internet.

Esta é a fase 2 de 5 do programa de refatoração. As fases seguintes (autorização por dono/GM nas rotas, modelo de dados) só têm sentido se a identidade do usuário for confiável.

## What Changes

- **BREAKING** O login passa a exigir nome de treinador e senha. Sem senha correta não há sessão. O campo `role` e o e-mail deixam de ser aceitos no formulário: o papel vem sempre do banco.
- Senhas guardadas só como hash com salt (`scrypt`, módulo `crypto` do Node, sem nova dependência). Nunca em texto, em log ou em resposta.
- Cadastro inicial do GM: enquanto nenhum usuário tiver senha, a tela `/setup` permite criar a conta do GM (o primeiro usuário). Depois disso a tela deixa de existir.
- Sem cadastro público: só o GM cria contas de jogadores e redefine senhas, pelo painel `/admin`. Um usuário pode trocar a própria senha.
- Proteção contra tentativa em série: bloqueio temporário após falhas seguidas no mesmo nome, com mensagem de erro igual para "usuário inexistente" e "senha errada".
- Remover o login antigo: o formulário manual em `src/app/page.tsx`, o botão de Discord e o "Dev Login" em `src/App.tsx`, o `PrismaAdapter` e o evento `createUser` do `src/auth.ts`, e o `loginScreen.test.tsx`.
- Exigir `AUTH_SECRET`: sem a variável, o servidor se recusa a autenticar em vez de usar um segredo padrão.
- Esquema do banco: o `User` ganha `passwordHash` e o `username` passa a identificar o login (único, sem diferenciar maiúsculas de minúsculas).

Fora de escopo: autorização por dono/GM nas rotas de API (fase 3), reestruturação das fichas (fase 4), divisão do `App.tsx` (fase 5), recuperação de senha por e-mail e login social. As tabelas `Account`, `Session` e `VerificationToken` ficam como estão; a limpeza delas entra na fase 4.

## Capabilities

### New Capabilities

- `authentication`: como um jogador ou o GM prova quem é (nome e senha), como as contas são criadas e protegidas, como a sessão é estabelecida e encerrada, e quais proteções existem contra uso indevido.

### Modified Capabilities

(nenhuma; as specs `observability` e `project-structure` não mudam)

## Impact

- **Código:** `src/auth.ts` (reescrito), `src/app/page.tsx` (vira guarda no servidor), novas rotas `src/app/login`, `src/app/setup`, ações de servidor em `src/app/admin`, módulo de senha e de limite de tentativas em `src/lib`, `src/App.tsx` (remove o bloco de login antigo), `src/components/SessionProvider.tsx` (mantido se ainda for usado).
- **Banco:** `prisma/schema.prisma` ganha `User.passwordHash`; aplicado com `prisma db push` (o projeto não usa migrations). Usuários existentes ficam sem senha até o GM definir uma.
- **Operação:** `AUTH_SECRET` passa a ser obrigatória (já existe no `.env`). Sessões atuais são encerradas, pois o formato do token muda.
- **Testes:** novos testes de senha, de login, de cadastro inicial, de administração de contas e de limite de tentativas; `loginScreen.test.tsx` é removido.
- **Dependências:** nenhuma nova.
