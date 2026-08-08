---
tags: [documentacao-viva, projeto, arquitetura, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-08-07
autor: "Antigravity"
---

# 🏗️ Estrutura de Diretórios - Trainer Card Pro

> Mapeamento da organização de pastas e papéis dos diretórios no projeto Trainer Card Pro.

---

## Resumo

Mapeamento hierárquico de toda a árvore de diretórios do repositório Trainer Card Pro, especificando o propósito de cada pasta e subpasta.

---

## Conexões

- **Árvore Completa (Exportável):** [[\[Arquitetura\] Arvore de Diretorios]]
- **Mapa Mestre:** [[_VaultMap]]
- **Stack Geral:** [[\[Arquitetura\] Stack Tecnologica]]

---

## 📂 Visão Geral da Estrutura

```text
trainer-card-pro/
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
│       ├── health/                   # API de monitoramento de saúde do sistema
│       ├── item/                     # API de itens
│       ├── note/                     # API de notas e anotações
│       ├── pokemon/                  # API de pokémons
│       ├── trade/                    # API de trocas de pokémon
│       └── upload/                   # API para upload de arquivos
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
├── conteudo/                         # Conteúdo auxiliar e referências do sistema
├── docs/                             # Documentação detalhada em formato [Categoria] Nome.md (Obsidian Vault)
│   ├── _VaultMap.md                  # Mapa geral da documentação
│   └── skills/                       # Instruções e habilidades para agentes de IA
│
├── lib/                              # Utilitários e configurações de bibliotecas externas
│   ├── cache.ts                      # Sistema de cache local
│   ├── json.ts                       # Utilitários JSON
│   ├── prisma.ts                     # Instância compartilhada do Prisma Client
│   ├── routeHelpers.ts               # Auxiliares de rotas da API
│   ├── safeFetch.ts                  # Wrapper para chamadas fetch seguras
│   └── telemetry.ts                  # Monitoramento de telemetria
│
├── prisma/                           # Configuração do banco de dados (Prisma ORM)
│   └── schema.prisma                 # Schema do banco de dados
│
├── scripts/                          # Scripts utilitários e testes
│   ├── deploy-rollback.js            # Script de rollback
│   ├── regression-test.js            # Testes de regressão
│   └── test-persistence.js           # Testes de persistência
│
└── src/                              # Código-fonte adicional
    └── data/
        └── capabilities.ts           # Capacidades PTU
```

---

## Estado Atual e Próximos Passos

- [x] Mapeamento completo das pastas `app/`, `components/`, `lib/`, `prisma/`, `scripts/` e `docs/`.
- [x] Árvore interativa exportável disponível no documento dedicado [[\[Arquitetura\] Arvore de Diretorios]].
- [ ] Atualizar estrutura conforme surgirem novos microsserviços.