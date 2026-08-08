---
tags: [documentacao-viva, projeto, mapa, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-08-07
autor: "Antigravity"
---

# 🗺️ Vault Map & Index (Trainer Card Pro)

> Este é o **Arquivo de Mapa Principal** da documentação do projeto.
> Ele serve como um atalho de alto desempenho para localizar rapidamente os arquivos `.md` e os arquivos de código-fonte correspondentes, economizando tokens e otimizando buscas contextuais.

---

## ⚡ Indexador de Caminhos Rápidos

Use esta tabela para localizar instantaneamente o arquivo de documentação e o código correspondente no workspace local.

### 🌐 Visão Geral & Regras Globais

| Nota Obsidian | 📁 Arquivo de Documentação (.md) | 💻 Arquivo de Código Fonte Correspondente | Descrição Curta |
|---|---|---|---|
| [[\[Visao Geral\] Trainer Card Pro]] | [[Visao Geral] Trainer Card Pro.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BVisao%20Geral%5D%20Trainer%20Card%20Pro.md) | — | Entrada principal e visão geral da arquitetura de abas. |
| [[\[Arquitetura\] Features e Regras]] | [[Arquitetura] Features e Regras.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BArquitetura%5D%20Features%20e%20Regras.md) | — | Persistência, temas e motor de regras/cálculos automáticos. |
| [[\[Dados\] Tipagem TypeScript]] | [[Dados] Tipagem TypeScript.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BDados%5D%20Tipagem%20TypeScript.md) | [types.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/types.ts) | Modelagem de dados, estatísticas, itens e Pokémon. |
| [[\[Dados\] Constantes]] | [[Dados] Constantes.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BDados%5D%20Constantes.md) | [constants.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/constants.ts) | Valores padrões, temas de cores e perícias base do PTU. |
| [[\[Dados\] Capacidades PTU]] | [[Dados] Capacidades PTU.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BDados%5D%20Capacidades%20PTU.md) | [capabilities.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/src/data/capabilities.ts) | Tabelas e conversão estática de Força, Salto e Inteligência. |
| [[\[Interface\] Estilos e Temas]] | [[Interface] Estilos e Temas.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BInterface%5D%20Estilos%20e%20Temas.md) | [index.css](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/index.css) | Cursores de Pokébola, efeitos hologramas e animações customizadas. |
| [[\[Arquitetura\] Stack Tecnologica]] | [[Arquitetura] Stack Tecnologica.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BArquitetura%5D%20Stack%20Tecnologica.md) | [package.json](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/package.json) | React 19, TypeScript, Next.js 15 (App Router), Tailwind CSS e dependências. |
| [[\[Arquitetura\] Sistema de Dados]] | [[Arquitetura] Sistema de Dados.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BArquitetura%5D%20Sistema%20de%20Dados.md) | — | Ciclo de vida, auto-save, migração profunda de localStorage e fluxo Equipe-PC. |
| [[\[Arquitetura\] Estrutura de Diretorios]] | [[Arquitetura] Estrutura de Diretorios.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BArquitetura%5D%20Estrutura%20de%20Diretorios.md) | — | Mapeamento completo de pastas e estrutura do repositório. |
| [[\[Arquitetura\] Arvore de Diretorios]] | [[Arquitetura] Arvore de Diretorios.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BArquitetura%5D%20Arvore%20de%20Diretorios.md) | — | Árvore física completa em formato de texto/ASCII exportável para relatórios. |

### 🏗️ App Router & Infraestrutura (Next.js)

| Nota Obsidian | 📁 Arquivo de Documentação (.md) | 💻 Arquivo de Código Fonte Correspondente | Descrição Curta |
|---|---|---|---|
| [[\[Arquitetura\] Stack Tecnologica]] | [[Arquitetura] Stack Tecnologica.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BArquitetura%5D%20Stack%20Tecnologica.md) | [layout.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/layout.tsx) | Layout raiz do App Router. HTML, head (Font Awesome), CSS global. |
| [[\[Arquitetura\] Stack Tecnologica]] | [[Arquitetura] Stack Tecnologica.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BArquitetura%5D%20Stack%20Tecnologica.md) | [page.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/page.tsx) | Página raiz (rota `/`). Client component que renderiza o App. |
| [[\[Interface\] ErrorHandler]] | [[Interface] ErrorHandler.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BInterface%5D%20ErrorHandler.md) | [error.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/error.tsx) | Error boundary raiz e tratamento de exceções não capturadas no App Router. |
| [[\[Arquitetura\] Stack Tecnologica]] | [[Arquitetura] Stack Tecnologica.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BArquitetura%5D%20Stack%20Tecnologica.md) | [next.config.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/next.config.ts) / [postcss.config.mjs](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/postcss.config.mjs) / [tailwind.config.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/tailwind.config.ts) / [next-env.d.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/next-env.d.ts) | Configurações do Next.js, PostCSS, Tailwind CSS e declarações de tipos globais. |

### 🧩 Componentes React (Núcleo)

| Nota Obsidian | 📁 Arquivo de Documentação (.md) | 💻 Arquivo de Código Fonte Correspondente | Descrição Curta |
|---|---|---|---|
| [[\[Componente\] App]] | [[Componente] App.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BComponente%5D%20App.md) | [App.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/App.tsx) | Componente-mãe. Controla abas, modais, exportação e estados. |
| [[\[Componente\] PokemonCreationSheet]] | [[Componente] PokemonCreationSheet.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BComponente%5D%20PokemonCreationSheet.md) | [PokemonCreationSheet.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/PokemonCreationSheet.tsx) | Formulário completo de criação rápida e detalhada de Pokémon. |
| [[\[Componente\] TeamTab]] | [[Componente] TeamTab.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BComponente%5D%20TeamTab.md) | [TeamTab.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/TeamTab.tsx) | Controle dos 6 membros do time principal de combate. |
| [[\[Componente\] PcTab]] | [[Componente] PcTab.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BComponente%5D%20PcTab.md) | [PcTab.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/PcTab.tsx) | Computador PC para armazenamento e swap de Pokémon em 99 caixas. |
| [[\[Componente\] DerivedBox]] | [[Componente] DerivedBox.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BComponente%5D%20DerivedBox.md) | [DerivedBox.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/DerivedBox.tsx) | Cartão compacto para valores derivados (evasão, movimentos). |
| [[\[Componente\] ImageCropper]] | [[Componente] ImageCropper.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BComponente%5D%20ImageCropper.md) | [ImageCropper.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/ImageCropper.tsx) | Recorte interativo quadrado 1:1 baseado no canvas HTML5. |
| [[\[Componente\] InfoField]] | [[Componente] InfoField.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BComponente%5D%20InfoField.md) | [InfoField.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/InfoField.tsx) | Entrada de texto Pokédex para dados biográficos e de perfil. |
| [[\[Componente\] SmartInput]] | [[Componente] SmartInput.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BComponente%5D%20SmartInput.md) | [SmartInput.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/SmartInput.tsx) | Input de calculadora matemática inline com sanitização robusta. |
| [[\[Componente\] NotesTab]] | [[Componente] NotesTab.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BComponente%5D%20NotesTab.md) | [NotesTab.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/NotesTab.tsx) | Notas livres em formato de diário de campanha com suporte GFM. |
| [[\[Interface\] PokéPapo e Layout]] | [[Interface] PokéPapo e Layout.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BInterface%5D%20Pok%C3%A9Papo%20e%20Layout.md) | [PokePapo.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/PokePapo.tsx) / [AttackCard.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/AttackCard.tsx) | Gaveta lateral retrátil de chat (PokéPapo) e cartões de ataque (PTA 2.0) integrados. |

### 🗄️ Backend, Banco de Dados, APIs & DevOps

| Nota Obsidian | 📁 Arquivo de Documentação (.md) | 💻 Arquivo de Código Fonte Correspondente | Descrição Curta |
|---|---|---|---|
| [[\[Arquitetura\] Banco de Dados]] | [[Arquitetura] Banco de Dados.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BArquitetura%5D%20Banco%20de%20Dados.md) | [schema.prisma](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/prisma/schema.prisma) / [prisma.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/lib/prisma.ts) / [prisma.config.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/prisma.config.ts) / [Trainer Card Pro.session.sql](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/Trainer%20Card%20Pro.session.sql) | Modelagem relacional da Ficha, Pokémons, Itens, Notas e Trocas com SQLite e Prisma. |
| [[\[Utilitario\] SafeFetch]] | [[Utilitario] SafeFetch.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BUtilitario%5D%20SafeFetch.md) | [safeFetch.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/lib/safeFetch.ts) | Utilitário genérico para chamadas HTTP resilientes e captura automatizada de erros. |
| [[\[Rotas\] API da Ficha]] | [[Rotas] API da Ficha.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BRotas%5D%20API%20da%20Ficha.md) | [api/character](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/api/character/route.ts) / [api/pokemon](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/api/pokemon/route.ts) / [api/item](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/api/item/route.ts) / [api/note](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/api/note/route.ts) | Endpoints CRUD para persistência de dados de personagens, pokémons, inventário e diário. |
| [[\[Rotas\] Upload de Arquivos]] | [[Rotas] Upload de Arquivos.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BRotas%5D%20Upload%20de%20Arquivos.md) | [api/upload](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/api/upload/route.ts) | Upload físico de imagens de avatar e Pokémons em multipart/form-data com salvamento em disco. |
| [[\[Sistemas\] Sistema de Trocas]] | [[Sistemas] Sistema de Trocas.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BSistemas%5D%20Sistema%20de%20Trocas.md) | [api/trade](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/app/api/trade/route.ts) / [TradeModal.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/TradeModal.tsx) | Mecânica assíncrona de link cable para solicitação e aceitação de trocas de itens e pokémons. |
| [[\[DevOps\] Telemetria e Observabilidade]] | [[DevOps] Telemetria e Observabilidade.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BDevOps%5D%20Telemetria%20e%20Observabilidade.md) | [telemetry.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/lib/telemetry.ts) / [cache.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/lib/cache.ts) / [deploy-rollback.js](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/scripts/deploy-rollback.js) / [regression-test.js](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/scripts/regression-test.js) / [test-persistence.js](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/scripts/test-persistence.js) | Sistema DevOps de Request IDs, Logs JSON estruturados, Healthcheck, Cache Hits e Rollback. |
| [[\[DevOps\] Analise de Erros]] | [[DevOps] Analise de Erros.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BDevOps%5D%20Analise%20de%20Erros.md) | — | Auditoria de tratamento de erros, falhas silenciosas, falta de feedback e propostas de UX. |
| [[vault-architect]] | [SKILL.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/skills/vault-architect/SKILL.md) | — | Diretrizes operacionais para sincronização de documentação viva integrada ao Obsidian Vault. |
| [[devops-nextjs-telemetry]] | [SKILL.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/skills/devops-nextjs-telemetry/SKILL.md) | — | Diretrizes para monitoramento, logs estruturados em JSON, health checks e alertas em Next.js. |
| [[dry-code-refactor]] | [SKILL.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/skills/dry-code-refactor/SKILL.md) | [routeHelpers.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/lib/routeHelpers.ts) / [json.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/lib/json.ts) | Protocolo de unificação de rotas (validação, JSON parsing) e genericização do `InfoField<T>`. |

---

## 🧭 Fluxo de Edição / Modus Operandi (Para o Assistente de IA)

Ao receber solicitações de alteração de código, siga estritamente estas etapas para manter a integridade com zero desperdício de tokens:

1. **Localizar Código**: Encontre o arquivo de código fonte na coluna `Arquivo de Código Fonte` correspondente ao recurso solicitado.
2. **Localizar Nota**: Veja qual `.md` descreve este componente na coluna `Arquivo de Documentação`.
3. **Editar Código**: Realize a implementação do código com qualidade.
4. **Atualizar Documentação**: Abra imediatamente o arquivo `.md` correspondente usando o link de arquivo absoluto e atualize a especificação técnica de acordo com a modificação realizada.
5. **Registrar no Mapa**: Se um novo arquivo for criado, adicione uma nova entrada neste mapa principal imediatamente.

---

## 🕒 Histórico de Atividades

| Data | Hora | Arquivos Modificados | Descrição da Atividade |
|---|---|---|---|
| 2026-05-22 | 17:08 | [_VaultMap.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/_VaultMap.md) / [SKILL.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/skills/vault-architect/SKILL.md) | Criação da skill `vault-architect` e indexação mestre no mapa do Obsidian Vault. |
| 2026-06-15 | 23:40 | [PokePapo.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/PokePapo.tsx) / [AttackCard.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/AttackCard.tsx) / [App.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/App.tsx) / [[Interface] PokéPapo e Layout.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/%5BInterface%5D%20Pok%C3%A9Papo%20e%20Layout.md) | Implementação da gaveta lateral retrátil PokéPapo, do card de ataque estilo PTA 2.0 (AttackCard), integração flex layout no App.tsx e documentação viva correspondente. |
| 2026-08-07 | 20:25 | [docs/*.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/) / [_VaultMap.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/_VaultMap.md) | Auditoria e alinhamento universal de 100% dos arquivos de código com a skill `vault-architect`. Criação de [[Interface] ErrorHandler.md] e [[Utilitario] SafeFetch.md], padronização de YAML frontmatter, seções formais de Resumo, Conexões e checklist obrigatorio de `Estado Atual e Próximos Passos`. |
| 2026-08-07 | 20:32 | [docs/*.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/) / [_VaultMap.md](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/docs/_VaultMap.md) | Padronização universal da nomenclatura de todos os 29 arquivos da documentação viva com o formato de colchetes `[Categoria] Nome.md` e atualização em cadeia de todas as referências `[[WikiLinks]]`. |

---

## 🏷️ Tags
#mapa #vault #obsidian #index #caminhos #performance #skills #documentacao #relacional #sincronizacao #tipografia #devops #observabilidade #telemetria #padronizacao #colchetes

---

## Resumo

O `_VaultMap.md` é o mapa e índice mestre da documentação viva do projeto Trainer Card Pro, fornecendo links Obsidian `[[WikiLinks]]` e links locais `file:///` para navegação instantânea.

---

## Conexões

- **Todos os Arquivos:** Indexador universal de todos os arquivos `.md` e arquivos de código do repositório.

---

## Estado Atual e Próximos Passos

- [x] Tabela de índice por componentes, rotas, backend e skills.
- [x] Histórico de Atividades atualizado continuadamente.
- [x] Nomenclatura 100% padronizada com colchetes de categorias (`[Categoria] Nome.md`).
- [ ] Manter sincronização automática contínua via skill [[vault-architect]].
