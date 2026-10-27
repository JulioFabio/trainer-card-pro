# Proposal

## Why

Depois da fase 2, só entra no app quem escolhe um perfil, mas a API de dados continua aberta. Das 7 rotas em `src/app/api`, apenas `/character` e `/health` verificam algo: `/item`, `/note`, `/pokemon`, `/trade` e `/upload` não exigem sessão. Qualquer visitante com o link, sem entrar, consegue ler, alterar e apagar itens, notas, Pokémon e trocas de qualquer jogador, e enviar arquivos.

O `/upload` é o ponto mais grave: monta o caminho da pasta com o `characterId` recebido, sem validar (um valor como `../../x` escreve fora de `public/uploads`), aceita qualquer tipo e tamanho de arquivo e o serve de forma estática, o que permite hospedar HTML ou SVG com script no mesmo endereço do app. Além disso, nenhuma rota valida o corpo das requisições: o JSON vai quase direto para o Prisma, sem checar tipos nem tamanho.

Há também um efeito colateral da fase 2: a sessão é um token JWT de até 3 horas. Se o Mestre remover um perfil, quem estava logado nele continua passando pela checagem de "tem sessão", e o `POST /character` ainda recria o usuário apagado.

Esta é a fase 3 de 5. A mesa é de confiança (qualquer jogador pode entrar no perfil de outro), então o objetivo não é impedir má-fé entre jogadores, e sim fechar a API para quem não entrou, impedir engano (mexer na ficha do colega sem querer) e eliminar as falhas técnicas do upload e da entrada de dados.

## What Changes

- **BREAKING** Todas as rotas de dados passam a exigir sessão e respondem `401` sem ela. Só `/api/health` e `/api/auth/*` continuam públicas.
- **Escrita só pelo dono ou pelo GM**: criar, alterar e apagar Pokémon, itens, notas, trocas enviadas e imagens exige ser o dono da ficha afetada ou o GM (`403` caso contrário).
- **BREAKING Leitura aberta a quem está logado**: qualquer jogador pode ver qualquer ficha, com Pokémon, itens e notas. Hoje `GET /character?id=` devolve `403` para ficha alheia; isso muda.
- **Trocas**: quem cria a proposta precisa ser dono da ficha remetente; só o dono da ficha destinatária (ou o GM) aceita ou recusa; a troca só muda se estiver pendente. Ambas as fichas precisam existir.
- **Sessão conferida no banco**: a sessão só vale se o perfil ainda existe, e o papel (GM ou jogador) é lido do banco a cada requisição, não do token. Isso encerra, na prática, a sessão de um perfil removido.
- **Validação de entrada** em todas as rotas, com esquemas tipados (zod): tipos, limites de tamanho e de valores, campos desconhecidos recusados, erros `400` em pt-BR no formato único `{ error }`. A ficha (`sheetData`) tem teto de 8 MB, porque hoje as fotos dos Pokémon ficam embutidas nela em base64 (a fase 4 as tira de lá).
- **Upload seguro**: só imagens PNG, JPEG, WebP e GIF, conferidas pelo conteúdo (nunca SVG), até 5 MB, para uma ficha existente em que o usuário pode escrever. O servidor gera o nome do arquivo e o caminho nunca sai de `public/uploads`.
- **Helpers centralizados** de sessão, permissão e resposta de erro, para as rotas ficarem finas e a regra existir em um só lugar. Sem camada de serviços pesada.
- **Cache coerente**: com a leitura aberta, o cache da ficha deixa de depender do usuário; escritas em item, nota e Pokémon passam a invalidá-lo.
- Ajustes mínimos no front, sem mudança visual: a lista de personagens do `TradeModal` (hoje fictícia) passa a vir da API, para que a validação de "ficha destinatária existe" não quebre o fluxo de trocas.

Fora de escopo: reestruturação do modelo de dados das fichas (fase 4), divisão do `App.tsx` (fase 5), empacotamento, e limite de requisições por IP.

## Capabilities

### New Capabilities

- `api-access-control`: quem pode chamar cada rota de dados, quem pode ler e quem pode alterar fichas e seus dependentes (Pokémon, itens, notas, trocas), e como a sessão é conferida a cada requisição.
- `request-validation`: forma, tipos, limites e mensagens de erro das entradas da API.
- `image-upload`: quais arquivos de imagem o servidor aceita, onde os guarda e como os nomeia.

### Modified Capabilities

(nenhuma; as specs `observability`, `project-structure` e `authentication` não mudam)

## Impact

- **Código:** todas as rotas em `src/app/api/*/route.ts`; novos módulos em `src/lib` (sessão e permissões, esquemas de validação, upload); `src/components/TradeModal.tsx` (lista de personagens reais); `src/lib/cache.ts` não muda, mas o uso dele nas rotas sim.
- **Testes:** os testes de `character` (unit e integration) mudam por causa da leitura aberta; novos testes de acesso, validação e upload para todas as rotas.
- **Dependências:** `zod` (dependência de produção).
- **Comportamento visível:** nenhum para quem usa o app normalmente. Quem tentar chamar a API sem sessão, enviar arquivos que não sejam imagens ou alterar a ficha de outro passa a receber erro.
- **Dados existentes:** o banco está limpo desde a fase 2, então não há migração.
