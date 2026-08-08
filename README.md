# 🔴 Trainer Card Pro

> Ficha digital interativa, relacional e de alta performance para o Sistema RPG **Pokémon: Tabletop Adventures 2.0 (PTA 2.0)**.

---

## 🚀 Tecnologias & Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização & Design System**: [TailwindCSS 3.4](https://tailwindcss.com/) + Custom CSS (Variaveis HSL/HEX, Efeitos Holográficos CRT, Google Font Outfit)
- **Banco de Dados & ORM**: SQLite relacional + [Prisma 7 ORM](https://www.prisma.io/) (`@prisma/adapter-better-sqlite3` / `better-sqlite3`)
- **DevOps & Observabilidade**: Logs JSON Estruturados, Request IDs únicos, Monitoramento de Métricas (`/api/health`), Testes de Regressão e Deploy com Auto-Rollback
- **Documentação Viva**: Obsidian Knowledge Graph em `/docs` com indexador `_VaultMap.md` e conformidade com a skill `vault-architect`

---

## 📦 Instalação e Execução

### Pré-requisitos
- **Node.js**: v18.x ou superior (Recomendado LTS)

> [!IMPORTANT]
> **Atenção com softwares de segurança:** Antivírus no Windows podem bloquear a execução de scripts `.ps1` ou a escrita na pasta `node_modules`.

> [!TIP]
> **Windows PowerShell (Erros de Execução de Script):**
> Caso encontre um erro de permissão (`PSSecurityException`), libere a execução para o usuário atual:
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/JulioFabio/trainer-card-pro.git
   cd trainer-card-pro
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure e sincronize o Banco de Dados SQLite:**
   ```bash
   npx prisma db push
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:3000`.

---

## 🛠️ Módulos & Estrutura de Abas

| Aba | Função & Descrição |
|---|---|
| **🧑 Treinador** | Perfil completo do personagem, avatar com cropper 1:1, dados biográficos e até 4 classes PTU |
| **⚔️ Combate** | Atributos, HP, 24 perícias ativas, evasões calculadas e capacidade de movimento |
| **👥 Equipe** | Os 6 Pokémons ativos na party com atalho rápido para abas dinâmicas de edição inline |
| **🎒 Mochila** | Inventário relacional de itens e controle de quantidades |
| **💻 PC (Box)** | Armazenamento de Pokémons em até 99 caixas com capacidade de 30 slots por caixa e swap rápido |
| **📝 Notas** | Diário de jornada com editor Markdown (GFM), categorias e auto-save |
| **💬 PokéPapo** | Gaveta lateral retrátil de chat para rolagens de dados, histórico de combate e interação |

---

## ✨ Funcionalidades Principais

- [x] **Persistência Relacional Relâmpago** — Integrada com SQLite + Prisma 7 ORM e APIs REST com auto-save inline debitado.
- [x] **Sistema de Abas Dinâmicas de Pokémon** — Edição inline de Pokémons da Equipe e do PC em abas persistentes/efêmeras integradas ao header.
- [x] **Cálculos Matemáticos Automáticos** — HP máximo, evasões (Física/Especial/Veloz), iniciativa e capacidades físicas (Força, Salto, Inteligência).
- [x] **PokéPapo & Cartões de Ataque (AttackCard)** — Gaveta retrátil de chat e cartões visuais estilo PTA 2.0 com botões interativos para rolagens de acerto e dano.
- [x] **Link Cable (Sistema de Trocas)** — Mecânica assíncrona para solicitação e aceitação de trocas de Pokémons e itens entre treinadores.
- [x] **ImageCropper Canvas 1:1** — Modal interativo de recorte de fotos para avatares e Pokémons.
- [x] **SmartInput & Calculadora Inline** — Avaliação de expressões matemáticas em tempo real nos campos numéricos.
- [x] **Temas Temáticos da Pokédex** — 5 paletas de cores dinâmicas com sincronização de variáveis CSS `--theme-color` e scrollbars customizadas.
- [x] **Telemetria & Observabilidade DevOps** — Monitoramento `/api/health`, Request IDs com UUID, alertas de anomalia de memória e rotina de auto-rollback.
- [x] **Documentação Viva em Colchetes (`vault-architect`)** — Grafo de conhecimento em `/docs` padronizado em `[Categoria] Nome.md` e indexador `_VaultMap.md`.

---

## 🗺️ Roadmap do Projeto

- [x] **Fase 1: Banco de Dados Relacional & APIs REST** — Migração completa de localStorage para SQLite + Prisma ORM.
- [x] **Fase 2: Sistema de Abas Dinâmicas & Gaveta PokéPapo** — Abas efêmeras de Pokémon e gaveta lateral de combate.
- [x] **Fase 3: Padronização Vault Architect & DevOps Observability** — Telemetria com Request IDs e documentação viva sincronizada.
- [ ] **Fase 4: Autocomplete & Calculadora de Naturezas** — Efeito matemático automático de naturezas nos atributos base.
- [ ] **Fase 5: Suporte a Batalhas Automatizadas de Dados** — Rolador visual de dados integrado ao PokéPapo.

---

## 🧠 Documentação Viva & Grafo do Obsidian

O projeto possui uma documentação viva mantida na pasta `/docs`, estruturada segundo a skill `vault-architect`:
- Indexador Mestre: [docs/_VaultMap.md](file:///c:/SecondMind/trainer-card-pro/docs/_VaultMap.md)
- Arquitetura DB: [docs/[Arquitetura] Banco de Dados.md](file:///c:/SecondMind/trainer-card-pro/docs/%5BArquitetura%5D%20Banco%20de%20Dados.md)
- Estilos & Temas: [docs/[Interface] Estilos e Temas.md](file:///c:/SecondMind/trainer-card-pro/docs/%5BInterface%5D%20Estilos%20e%20Temas.md)
- Telemetria DevOps: [docs/[DevOps] Telemetria e Observabilidade.md](file:///c:/SecondMind/trainer-card-pro/docs/%5BDevOps%5D%20Telemetria%20e%20Observabilidade.md)

---

## 🤝 Créditos & Agradecimentos

- **[DrMrStark](https://www.reddit.com/user/DrMrStark/)** — Criador do sistema PTA 2.0.
- **Caio** — Tradutor oficial para PT-BR.
- **@DAVIDFONT** — Mestre da mesa e testador principal.

---

## ⚖️ Aviso Legal & Licença

*Pokémon e todos os nomes e imagens relacionados são marcas registradas da **The Pokémon Company**, Nintendo, Game Freak e Creatures Inc. Este é um projeto de fã, sem fins lucrativos e para uso educacional.* Licenciado sob a [MIT License](LICENSE).
