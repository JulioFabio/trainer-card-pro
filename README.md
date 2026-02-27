# Trainer Card Pro

> Ficha de personagem digital e interativa para o RPG **Pokémon: Livro do Jogador**.

## Tecnologias & Frameworks

Este projeto foi desenvolvido com:

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) como bundler / dev server
- [TailwindCSS](https://tailwindcss.com/) para estilização
- [React Markdown](https://github.com/remarkjs/react-markdown) com suporte a GFM

## 📦 Instalação

Como rodar o projeto localmente:

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/trainer-card-pro.git
   ```
2. Acesse a pasta:
   ```bash
   cd trainer-card-pro
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🛠️ Como usar

Abra o app no navegador após rodar `npm run dev`. A interface imita uma Pokédex com 6 abas:

| Aba           | Função                                                       |
| ------------- | ------------------------------------------------------------ |
| **Treinador** | Dados biográficos, avatar, classes e talentos                |
| **Combate**   | Atributos, HP, perícias e evasões calculadas                 |
| **Equipe**    | Pokémons na equipe ativa                                     |
| **Mochila**   | Gerenciamento de itens e quantidades                         |
| **PC**        | Baú de armazenamento de Pokémons (PC Box) com ficha completa |
| **Notas**     | Diário de jornada com editor e preview Markdown              |

A ficha é **salva automaticamente** no `localStorage`. Você também pode exportar/importar sua ficha como arquivo `.json`.

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
- [x] **Auto-save** — Dados persistidos automaticamente no navegador via `localStorage`.
- [x] **Proteção contra perda de dados** — Prompt de confirmação ao fechar a aba.
- [x] **SmartInput** — Campo de HP com suporte a expressões matemáticas (ex: `64-10`, `+5`).
- [x] **Dias de Jornada e Pokédex** — Contadores globais no header do app.

## 🗺️ RoadMap

- [ ] Implementar naturezas com efeito matemático automático nos atributos (ex: +2 Saúde / -2 Ataque).
- [ ] Autocomplete de espécies com Stats Base pré-definidos.
- [ ] Validação visual de ficha — alertas quando atributos excedem o permitido para o nível.
- [ ] Sistema de Evolução de Pokémon — troca de espécie mantendo os dados.
- [ ] Parser de conteúdo do livro de regras para banco de dados de itens.

## 📝 Licença

Este projeto está sob a licença MIT.
