---
tags: [documentacao-viva, projeto, arquitetura, arvore, diretorios, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-08-07
autor: "Antigravity"
---

# 🌳 Árvore de Diretórios e Arquivos (Trainer Card Pro)

> Visualização hierárquica completa de pastas e arquivos do repositório para exportação fácil, navegação rápida e auditoria de estrutura.

---

## Resumo

Este documento fornece a **Árvore de Diretórios Completa** do repositório `trainer-card-pro`. Ele foi estruturado no formato ASCII/Markdown para facilitar a cópia, exportação para relatórios e rápida visualização da arquitetura do projeto.

---

## Conexões

- **Mapa Mestre:** [[_VaultMap]]
- **Estrutura de Diretórios:** [[\[Arquitetura\] Estrutura de Diretorios]]
- **Stack Geral:** [[\[Arquitetura\] Stack Tecnologica]]
- **Banco de Dados:** [[\[Arquitetura\] Banco de Dados]]

---

## 📂 Árvore de Diretórios do Projeto (ASCII Tree)

```text
trainer-card-pro/
├── App.tsx                           # Componente-mãe React e orquestrador de estado global
├── LICENSE                           # Licença MIT do código fonte
├── README.md                         # Documentação principal de apresentação do repositório
├── Trainer Card Pro.session.sql      # Sessões SQL de desenvolvimento e consultas de teste
├── dev.db                            # Banco de dados SQLite local (gerado pelo Prisma)
├── constants.ts                      # Constantes do sistema (temas, perícias, defaults PTU)
├── index.css                         # Estilos globais (Tailwind, cursores customizados, animações CRT)
├── metadata.json                     # Metadados do projeto e workspace
├── next-env.d.ts                     # Declarações de tipos do Next.js
├── next.config.ts                    # Configuração de build e runtime do Next.js 15
├── package.json                      # Dependências, scripts e configurações da aplicação
├── package-lock.json                 # Arvore de dependências fixadas do npm
├── postcss.config.mjs                # Configuração do PostCSS para Tailwind CSS
├── prisma.config.ts                  # Configuração do ambiente Prisma 7 e datasource fallback
├── tailwind.config.ts                # Configuração de temas, cores e utilitários do Tailwind
├── tsconfig.json                     # Configuração estrita do compilador TypeScript
├── types.ts                          # Tipagens TypeScript universais do projeto (TrainerData, Pokemon, etc.)
│
├── app/                              # Estrutura do App Router (Next.js 15)
│   ├── layout.tsx                    # Layout raiz da Pokédex (HTML, fonts, scripts de tema)
│   ├── page.tsx                      # Componente de página raiz (renderiza o App.tsx)
│   ├── error.tsx                     # Error Boundary raiz e barreira visual de exceções
│   └── api/                          # Endpoints REST backend
│       ├── character/                # CRUD de dados biográficos e ficha do Treinador
│       │   └── route.ts
│       ├── health/                   # Endpoint de telemetria, observabilidade e health check
│       │   └── route.ts
│       ├── item/                     # CRUD de inventário e itens da mochila
│       │   └── route.ts
│       ├── note/                     # CRUD do diário de campanha e notas
│       │   └── route.ts
│       ├── pokemon/                  # CRUD de Pokémons (Time ativo e Caixas do PC)
│       │   └── route.ts
│       ├── trade/                    # Backend para sistema de trocas (Link Cable)
│       │   └── route.ts
│       └── upload/                   # Rota multipart/form-data para upload físico de mídias
│           └── route.ts
│
├── components/                       # Componentes React de Interface (Núcleo)
│   ├── AttackCard.tsx                # Card de ataques combatentes estilo PTA 2.0
│   ├── DerivedBox.tsx                # Cartão compacto de exibição de atributos derivados
│   ├── ImageCropper.tsx              # Recorte interativo de imagem 1:1 via Canvas HTML5
│   ├── InfoField.tsx                 # Campo de entrada Pokédex para perfil biográfico
│   ├── NotesTab.tsx                  # Editor Markdown de anotações com preview GFM
│   ├── PcTab.tsx                     # Sistema de caixas do Computador (PC 1-99)
│   ├── PokePapo.tsx                  # Gaveta lateral retrátil de chat e rolagens de dados
│   ├── PokemonCreationSheet.tsx      # Formulário completo de ficha técnica do Pokémon
│   ├── SmartInput.tsx                # Input inteligente com suporte a calculadora matemática inline
│   ├── TeamTab.tsx                   # Painel dos 6 Pokémons ativos na equipe
│   └── TradeModal.tsx                # Modal interativo de solicitação e aceite de trocas
│
├── conteudo/                         # Documentos auxiliares e referências do sistema RPG
│   ├── pokemon-livro-do-jogador-biblioteca-elfica.txt
│   └── reset_and_placeholders_implementation.md
│
├── docs/                             # Documentação Viva (Obsidian Vault - vault-architect)
│   ├── _VaultMap.md                  # Mapa Mestre e indexador de caminhos rápidos
│   ├── [Arquitetura] Banco de Dados.md
│   ├── [Arquitetura] Estrutura de Diretorios.md
│   ├── [Arquitetura] Features e Regras.md
│   ├── [Arquitetura] Roadmap Banco de Dados.md
│   ├── [Arquitetura] Sistema de Dados.md
│   ├── [Arquitetura] Stack Tecnologica.md
│   ├── [Componente] App.md
│   ├── [Componente] DerivedBox.md
│   ├── [Componente] ImageCropper.md
│   ├── [Componente] InfoField.md
│   ├── [Componente] NotesTab.md
│   ├── [Componente] PcTab.md
│   ├── [Componente] PokemonCreationSheet.md
│   ├── [Componente] SmartInput.md
│   ├── [Componente] TeamTab.md
│   ├── [Dados] Capacidades PTU.md
│   ├── [Dados] Constantes.md
│   ├── [Dados] Tipagem TypeScript.md
│   ├── [DevOps] Analise de Erros.md
│   ├── [DevOps] Telemetria e Observabilidade.md
│   ├── [Interface] ErrorHandler.md
│   ├── [Interface] Estilos e Temas.md
│   ├── [Interface] PokéPapo e Layout.md
│   ├── [Rotas] API da Ficha.md
│   ├── [Rotas] Upload de Arquivos.md
│   ├── [Sistemas] Sistema de Trocas.md
│   ├── [Utilitario] SafeFetch.md
│   ├── [Visao Geral] Trainer Card Pro.md
│   └── skills/                       # Skills operacionais para agentes de IA
│       ├── devops-nextjs-telemetry/
│       │   └── SKILL.md
│       ├── dry-code-refactor/
│       │   └── SKILL.md
│       └── vault-architect/
│           └── SKILL.md
│
├── lib/                              # Módulos utilitários do Backend/Frontend
│   ├── cache.ts                      # Gerenciador de cache local com TTL e métricas
│   ├── json.ts                       # Helper seguro para parse de JSON com try-catch
│   ├── prisma.ts                     # Instância singleton do Prisma Client com logging
│   ├── routeHelpers.ts               # Helper para validação e padronização de respostas de API
│   ├── safeFetch.ts                  # Wrapper resiliente sobre fetch nativo com tratamento de erro
│   └── telemetry.ts                  # Middleware de Request IDs, logs JSON e observabilidade
│
├── prisma/                           # Modelagem do Banco de Dados
│   └── schema.prisma                 # Schema relacional Prisma (User, Character, Item, Pokemon, Note, TradeRequest)
│
├── public/                           # Arquivos estáticos
│   └── uploads/                      # Diretório de destino de uploads físicos de imagens
│
├── scripts/                          # Scripts DevOps e Automação
│   ├── deploy-rollback.js            # Script para execução de rollback de deploy
│   ├── regression-test.js            # Suíte de testes automatizados de regressão
│   └── test-persistence.js           # Testes de persistência de dados SQLite
│
└── src/                              # Dados estáticos auxiliares
    └── data/
        └── capabilities.ts           # Tabelas e conversão estática de capacidades PTU
```

---

## 🗺️ Tabela Resumida por Módulo

| Módulo / Pasta | Qtd Arquivos | Descrição Resumida |
|---|---|---|
| **Raiz (`/`)** | 16 | Configurações do projeto, arquivos de tipagem, entrada principal (`App.tsx`) e banco SQLite |
| **`app/`** | 10 | Rotas de API backend REST e páginas do App Router (Next.js 15) |
| **`components/`** | 11 | Componentes React da Pokédex (Abas, Modais, PokéPapo, AttackCards) |
| **`docs/`** | 29 | Documentação viva sincronizada no Obsidian Vault em formato `[Categoria] Nome.md` |
| **`lib/`** | 6 | Helpers de infraestrutura, cache, Prisma Client, telemetria e fetch seguro |
| **`prisma/`** | 1 | Schema relacional do banco de dados |
| **`scripts/`** | 3 | Testes automatizados e scripts de deploy/rollback |
| **`src/data/`** | 1 | Dados de conversão estática de capacidades PTU |

---

## Estado Atual e Próximos Passos

- [x] Geração automática da árvore física completa do repositório.
- [x] Padronização de todos os nomes de arquivos Markdown no formato `[Categoria] Nome.md`.
- [ ] Manter atualização contínua da árvore a cada criação de novas rotas ou componentes.
