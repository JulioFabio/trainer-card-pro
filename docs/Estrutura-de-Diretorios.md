# Estrutura de Diretórios - Trainer Card Pro

Esta é a estrutura de diretórios e arquivos do projeto **Trainer Card Pro**, organizada de forma hierárquica.

```text
trainer-card-pro/
├── .env                              # Variáveis de ambiente
├── .gitignore                        # Arquivos ignorados pelo Git
├── .prettierrc                       # Configuração do Prettier
├── App.tsx                           # Componente principal / raiz da aplicação
├── LICENSE                           # Licença do projeto
├── README.md                         # Documentação principal de introdução
├── Trainer Card Pro.session.sql      # Script de sessões SQL de desenvolvimento
├── dev.db                            # Banco de dados SQLite local
├── constants.ts                      # Constantes gerais do projeto
├── index.css                         # Estilos globais (Tailwind / Vanilla CSS)
├── next-env.d.ts                     # Declarações de tipos do Next.js
├── next.config.ts                    # Configurações do Next.js
├── package.json                      # Dependências e scripts do projeto
├── package-lock.json                 # Lockfile do npm
├── postcss.config.mjs                # Configuração do PostCSS
├── prisma.config.ts                  # Configuração auxiliar do Prisma
├── tailwind.config.ts                # Configuração do Tailwind CSS
├── tsconfig.json                     # Configuração do TypeScript
├── types.ts                          # Tipagens globais do projeto
│
├── app/                              # Estrutura de rotas (Next.js App Router)
│   ├── layout.tsx                    # Layout global da aplicação
│   ├── page.tsx                      # Página inicial da aplicação
│   ├── error.tsx                     # Página de tratamento de erros global
│   └── api/                          # Rotas de API do backend
│       ├── character/                # API de gerenciamento de personagens
│       │   └── route.ts
│       ├── health/                   # API de monitoramento de saúde do sistema
│       │   └── route.ts
│       ├── item/                     # API de itens
│       │   └── route.ts
│       ├── note/                     # API de notas e anotações
│       │   └── route.ts
│       ├── pokemon/                  # API de pokémons
│       │   └── route.ts
│       ├── trade/                    # API de trocas de pokémon
│       │   └── route.ts
│       └── upload/                   # API para upload de arquivos
│           └── route.ts
│
├── components/                       # Componentes React reutilizáveis da interface
│   ├── AttackCard.tsx                # Card de exibição de ataques de um Pokémon
│   ├── DerivedBox.tsx                # Caixa para exibição de atributos derivados
│   ├── ImageCropper.tsx              # Componente para recortar imagens de perfil/upload
│   ├── InfoField.tsx                 # Campo de informações editável
│   ├── NotesTab.tsx                  # Aba de anotações e diário do treinador
│   ├── PcTab.tsx                     # Aba do PC (depósito de Pokémon)
│   ├── PokePapo.tsx                  # Interface de chat / discussão
│   ├── PokemonCreationSheet.tsx      # Modal/Planilha de criação de novos Pokémon
│   ├── SmartInput.tsx                # Campo de entrada inteligente com validação
│   ├── TeamTab.tsx                   # Aba com a equipe ativa de Pokémon do treinador
│   └── TradeModal.tsx                # Modal para realizar trocas entre treinadores
│
├── conteudo/                         # Conteúdo auxiliar, livros ou referências do sistema
│   ├── pokemon-livro-do-jogador-biblioteca-elfica.txt # Referência do livro de regras do jogador
│   └── reset_and_placeholders_implementation.md        # Documentação de implementação de placeholders
│
├── docs/                             # Documentação detalhada do projeto (Obsidian Vault)
│   ├── Análise de Erros.md
│   ├── App.md
│   ├── Capabilities.md
│   ├── Constants.md
│   ├── DerivedBox.md
│   ├── Estilos.md
│   ├── Features.md
│   ├── ImageCropper.md
│   ├── InfoField.md
│   ├── NotesTab.md
│   ├── PcTab.md
│   ├── PokemonCreationSheet.md
│   ├── Roadmap Fase 1 - Banco de Dados.md
│   ├── Sistema de Dados.md
│   ├── SmartInput.md
│   ├── Stack Tecnológica.md
│   ├── TeamTab.md
│   ├── Telemetria e Observabilidade.md
│   ├── Trainer Card Pro.md
│   ├── Types.md
│   ├── [Arquitetura] Banco de Dados.md
│   ├── [Interface] PokéPapo e Layout.md
│   ├── [Rotas] API da Ficha.md
│   ├── [Rotas] Upload de Arquivos.md
│   ├── [Sistemas] Sistema de Trocas.md
│   ├── _VaultMap.md                  # Mapa geral da documentação
│   └── skills/                       # Instruções e habilidades customizadas para agentes de IA
│       ├── devops-nextjs-telemetry/
│       │   └── SKILL.md
│       ├── dry-code-refactor/
│       │   └── SKILL.md
│       └── vault-architect/
│           └── SKILL.md
│
├── lib/                              # Utilitários e configurações de bibliotecas externas
│   ├── cache.ts                      # Sistema de cache local ou Redis
│   ├── json.ts                       # Utilitários para tratamento de dados JSON
│   ├── prisma.ts                     # Instância compartilhada do Prisma Client
│   ├── routeHelpers.ts               # Auxiliares para definição de rotas e respostas da API
│   ├── safeFetch.ts                  # Wrapper para chamadas fetch seguras com tratamento de erro
│   └── telemetry.ts                  # Monitoramento de telemetria e observabilidade
│
├── prisma/                           # Configuração do banco de dados (Prisma ORM)
│   └── schema.prisma                 # Definição do schema do banco de dados
│
├── public/                           # Arquivos estáticos servidos pelo Next.js
│   └── uploads/                      # Pasta de destino para os uploads de imagens/arquivos
│
├── scripts/                          # Scripts utilitários de suporte e testes
│   ├── deploy-rollback.js            # Script de rollback de deploy
│   ├── regression-test.js            # Testes de regressão automatizados
│   └── test-persistence.js           # Testes de persistência de dados
│
└── src/                              # Código-fonte adicional
    └── data/
        └── capabilities.ts           # Definição de capacidades do sistema
```
