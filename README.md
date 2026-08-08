# Trainer Card Pro

> Ficha de personagem digital e interativa para o Sistema RPG **Pokemon: Tabletop Adventures 2.0 (PTA 2.0)**.

## Tecnologias & Frameworks

Este projeto foi desenvolvido com:

- [Next.js 15 (App Router)](https://nextjs.org/) como framework React estrutural e camada de API/Banco de Dados
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/) para estilização
- [Prisma 7 ORM](https://www.prisma.io/) com SQLite (`@prisma/adapter-better-sqlite3` / `better-sqlite3`) para persistência relacional
- [React Markdown](https://github.com/remarkjs/react-markdown) com suporte a GFM
- [Google Fonts (Outfit)](https://fonts.google.com/specimen/Outfit) para tipografia moderna
- Telemetria DevOps com Request IDs únicos, monitoramento `/api/health` e logs JSON estruturados
- Documentação Viva integrada ao Obsidian Vault em `/docs` com o indexador `_VaultMap.md` (`vault-architect`)

## 📦 Instalação

### Pré-requisitos

Antes de começar, você precisa ter o **[Node.js](https://nodejs.org/)** instalado em sua máquina (recomendamos a versão LTS).

> [!IMPORTANT]
> **Atenção com softwares de segurança:** Alguns antivírus ou firewalls podem bloquear arquivos e execuções "suspeitas" durante o processo. Mesmo validando a confiança do arquivo no VS Code, esses softwares podem barrar a criação da pasta `node_modules` ou a execução de scripts ao rodar o `npm install`. Caso encontre erros de permissão, verifique as notificações do seu sistema de segurança.

> [!TIP]
> **Atenção ao usar Windows PowerShell (Erros de Execução de Script):**
> Caso encontre um erro de segurança/permissão como `PSSecurityException` ou `UnauthorizedAccess` ao rodar comandos como `npm` ou `npx` no PowerShell, isso ocorre porque a política padrão do Windows restringe a execução de scripts `.ps1`.
>
> Você pode resolver de duas formas:
>
> 1. **Liberar execução no terminal (Recomendado):** Abra o PowerShell e execute o comando abaixo para permitir a execução de scripts locais seguros para o seu usuário atual:
>    ```powershell
>    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
>    ```
> 2. **Contornar via prompt de comando clássico:** Alternativamente, execute os comandos prefixando com `cmd /c` (ex: `cmd /c npx prisma db push` e `cmd /c npm run dev`).

### Passo a passo

Como rodar o projeto localmente:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/JulioFabio/trainer-card-pro.git
   ```
2. Acesse a pasta:
   ```bash
   cd trainer-card-pro
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Configure o Banco de Dados local:
   ```bash
   npx prisma db push
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🛠️ Como usar

Abra o app no navegador após rodar `npm run dev`. A interface imita uma Pokédex com 6 abas:

| Aba           | Função                                                       |
| ------------- | ------------------------------------------------------------ |
| **Treinador** | Dados biográficos, avatar, classes e talentos                |
| **Combate**   | Atributos, HP, perícias e evasões calculadas                 |
| **Equipe**    | Pokémons na equipe ativa com abas inline                     |
| **Mochila**   | Gerenciamento de itens e quantidades                         |
| **PC**        | Baú de armazenamento de Pokémons (PC Box) com ficha completa |
| **Notas**     | Diário de jornada com editor e preview Markdown              |
| **PokéPapo**  | Gaveta lateral retrátil de chat para rolagens de dados, histórico de combate e cartões de ataque (AttackCard) |

A ficha é **salva automaticamente** no banco de dados SQLite relacional via APIs REST no Next.js (com migração e suporte a `localStorage`). Você também pode exportar/importar sua ficha como arquivo `.json`.

## ✨ Funcionalidades

- [x] **Ficha de Treinador** — Perfil completo com avatar, nome, conceito, dados biográficos e até 4 classes de carreira.
- [x] **Cálculos automáticos** — HP máximo, evasões físicas/especiais/velozes e capacidade de movimento calculados automaticamente a partir dos atributos.
- [x] **Sistema de Atributos com Caps** — Pontos de atributo com limite dinâmico baseado no nível (alerta visual quando excedido).
- [x] **Perícias Interativas** — 24 perícias do livro com ranks (Untrained / Trained / Expert), bônus customizáveis e total calculado automaticamente.
- [x] **Sistema de Talentos** — Adicionar/remover talentos com nome e descrição; tooltip ao passar o mouse; limite de talentos por nível.
- [x] **Mochila (Inventário)** — Adicionar, remover itens e controlar quantidades com `+` / `-`.
- [x] **PC Box** — Sistema completo de armazenamento de Pokémons com ficha detalhada (stats, golpes, capacidades, natureza, habilidades, evasões e mais).
- [x] **Ficha de Pokémon** — Golpes com tipo, categoria, dano, alcance, frequência e descritores; capacidades físicas (Força, Inteligência, Salto) e alternativas.
- [x] **Notas com Markdown** — Editor de texto com preview renderizado (suporte a tabelas, listas, tarefas e mais via GFM).
- [x] **Temas Pokédex** — 5 paletas de cores (Vermelho, Azul, Verde, Âmbar, Ardósia) aplicadas em toda a interface dinamicamente.
- [x] **Exportar / Importar JSON** — Backup e restauração completa da ficha.
- [x] **Auto-save** — Dados persistidos automaticamente no banco de dados SQLite relacional via APIs REST no Next.js (com sincronização assíncrona).
- [x] **Proteção contra perda de dados** — Prompt de confirmação ao fechar a aba.
- [x] **SmartInput** — Campo de HP com suporte a expressões matemáticas (ex: `64-10`, `+5`).
- [x] **Dias de Jornada e Pokédex** — Contadores globais no header do app.
- [x] **Infraestrutura Next.js (App Router)** — APIs REST CRUD para personagens, pokémons, itens, notas e upload de mídias.
- [x] **Abas Dinâmicas de Pokémon** — Fichas de Pokémons abertas no header do app em abas efêmeras (PC) e persistentes (Equipe).
- [x] **PokéPapo & Cartões de Ataque (AttackCard)** — Gaveta retrátil de chat e cartões visuais PTA 2.0 com botões para rolagens de acerto e dano.
- [x] **Link Cable (Sistema de Trocas)** — Mecânica assíncrona para solicitação e aceitação de trocas de Pokémons e itens entre treinadores.
- [x] **Telemetria & Observabilidade DevOps** — Monitoramento `/api/health`, Request IDs com UUID por requisição, alertas de anomalia de memória e rotina de auto-rollback.
- [x] **Documentação Viva Obsidian (`vault-architect`)** — Grafo de conhecimento em `/docs` padronizado com categorias em colchetes `[Categoria] Nome.md` e indexador mestre `_VaultMap.md`.

## 🗺️ RoadMap

- [x] **Fase 1: Integração com Banco de Dados** — Banco de dados robusto com rotas de API no Next.js para persistência de dados. Concluída com SQLite, Prisma ORM e rotas CRUD.
- [x] **Fase 2: Sistema de Abas Dinâmicas & Gaveta PokéPapo** — Abas inline para edição de Pokémons e gaveta retrátil de chat para combate.
- [x] **Fase 3: Padronização Vault Architect & DevOps Observability** — Observabilidade de API, health check `/api/health` e documentação viva sincronizada no Obsidian.
- [ ] Implementar naturezas com efeito matemático automático nos atributos (ex: +2 Saúde / -2 Ataque).
- [ ] Autocomplete de espécies com Stats Base pré-definidos.
- [ ] Validação visual de ficha — alertas quando atributos excedem o permitido para o nível.
- [ ] Sistema de Evolução de Pokémon — troca de espécie mantendo os dados.
- [ ] Parser de conteúdo do livro de regras para banco de dados de itens.

---

## 🤝 Créditos & Agradecimentos

Este projeto foi desenvolvido com base no esforço e criatividade de:

- **[DrMrStark](https://www.reddit.com/user/DrMrStark/)** — Criador original do sistema de RPG.
- **Caio** — Responsável pela tradução primorosa para PT-BR.
- **@DAVIDFONT** — Mestre da mesa, pela experiência de jogo saudável e divertida que inspirou esta ferramenta.

## ⚖️ Aviso Legal

_Pokémon e todos os nomes de personagens, músicas e imagens relacionados são marcas registradas da **The Pokémon Company**, Nintendo, Game Freak e Creatures Inc. Este é um projeto de fã, sem fins lucrativos._

## 📝 Licença

Este projeto é um software de código aberto licenciado sob a [MIT License](LICENSE).

> **Aviso:** Esta licença aplica-se apenas ao código-fonte deste projeto. Todos os direitos sobre a marca Pokémon, personagens e mecânicas originais pertencem à **The Pokémon Company**, Nintendo e Game Freak. Este é um projeto de fã, sem fins lucrativos e para uso educacional.
