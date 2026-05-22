---
name: vault-architect
description: "Ative sempre que houver alterações na estrutura do código, criação de novas funcionalidades ou modificações em arquivos .md. Gerencia a documentação viva sincronizada com o Obsidian Vault."
---

# 🧠 Objetivo: Vault Architect
Manter a pasta `/docs` como o reflexo em tempo real do estado do projeto, utilizando o arquivo `_VaultMap.md` como o índice mestre e garantindo total compatibilidade com o ecossistema Obsidian e atalhos físicos da workspace.

# 💎 Compatibilidade Obsidian (Vault Rules)

### 1. Propriedades (YAML Frontmatter)
Todo arquivo deve iniciar com o bloco de propriedades para organização via Dataview e busca:
```yaml
---
tags: [documentacao-viva, projeto, status/completo] # Tags hierárquicas
status: "ativo" # "em progresso", "ativo", "legado"
ultima_atualizacao: 2026-05-22
autor: "Antigravity"
---
```

### 2. Links e Sintaxe
- **WikiLinks:** Use estritamente `[[Nome do Arquivo]]` para conexões internas no grafo de conhecimento.
- **Atalhos Locais:** Na tabela rápida do `_VaultMap.md`, utilize o protocolo `file:///` apontando para o caminho absoluto do arquivo no disco do usuário, permitindo abertura instantânea.
- **Callouts:** Destaque informações críticas usando a sintaxe de alertas do Obsidian:
  > [!IMPORTANT]
  > Mudanças em esquemas de dados exigem migrações no Prisma (`npx prisma db push`).

# 🚀 Gatilhos de Ativação (Triggers)
- **Mudança Estrutural:** Alteração de lógica em `src/` ou `app/api/`, novas rotas, componentes ou novos modelos no Prisma.
- **Regras de Negócio:** Alteração em fórmulas de cálculo ou estados globais de dados.
- **Documentação Manual:** Edição direta de arquivos `.md` na pasta `/docs`.
- **Ponto de Controle:** Ao finalizar uma funcionalidade ou encerrar a sessão de trabalho.

# 📋 Diretrizes Operacionais

### 1. Sincronização e Filtro
- **Criação Automática:** Se uma funcionalidade nova surgir no código sem um `.md` correspondente em `/docs`, crie-o imediatamente.
- **Esquema de Dados:** Se houver alteração no arquivo `prisma/schema.prisma`, atualize o diagrama Mermaid na nota `[[[Arquitetura] Banco de Dados]]`.
- **Regras Matemáticas:** Se houver alteração em cálculos de atributos derivados ou caps de nível, especifique a fórmula lógica correspondente no arquivo da aba afetada.

### 2. Manutenção do _VaultMap.md
Este arquivo é o mapa do Grafo de Conhecimento:
- **Organização:** Categorize por seções (ex: 🏗️ App Router (Next.js), 🧩 Componentes React (Núcleo), 🗄️ Backend, Banco de Dados & APIs).
- **Conexões:** Liste os arquivos usando `[[WikiLinks]]` apontando para o arquivo físico `.md` da documentação e links `file:///` para os arquivos de código.
- **Última Atividade:** Mantenha uma seção no final do arquivo com o histórico de atividades: `Data - Hora - Descrição da atividade`.

### 3. Estrutura Obrigatória dos Documentos (.md)
1. **Resumo:** O que o componente/serviço faz.
2. **Conexões:** Dependências e arquivos relacionados via `[[WikiLinks]]`.
3. **Fórmulas e Comportamentos (Se aplicável):** Detalhamento matemático ou regras de validação.
4. **## Estado Atual e Próximos Passos:**
   - Lista de próximas tarefas em formato de TODO (`- [ ]`).

# 🛠 Exemplo de Saída
**Usuário:** "Criei o endpoint para evoluir Pokémon na rota `/api/pokemon/evolve`."
**Ação da Skill:**
1. Cria `docs/[Rotas] Evolução de Pokémon.md` estruturado.
2. Atualiza `docs/[Arquitetura] Banco de Dados.md` caso altere dados.
3. Insere a nova rota na tabela `_VaultMap.md` com link físico local `file:///.../app/api/pokemon/evolve/route.ts`.
4. Atualiza o histórico de atividades no rodapé do `_VaultMap.md`.

# ⚠️ Restrições
- Não duplique código fonte dentro dos arquivos Markdown.
- Priorize explicar o "porquê" (decisões de design, tradeoffs) e a arquitetura de dados.
