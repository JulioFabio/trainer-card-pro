# 🗺️ Vault Map & Index (Trainer Card Pro)

> Este é o **Arquivo de Mapa Principal** da documentação do projeto.
> Ele serve como um atalho de alto desempenho para localizar rapidamente os arquivos `.md` e os arquivos de código-fonte correspondentes, economizando tokens e otimizando buscas contextuais.

---

## ⚡ Indexador de Caminhos Rápidos

Use esta tabela para localizar instantaneamente o arquivo de documentação e o código correspondente no workspace local.

| Nota Obsidian | 📁 Arquivo de Documentação (.md) | 💻 Arquivo de Código Fonte Correspondente | Descrição Curta |
|---|---|---|---|
| [[Trainer Card Pro]] | [Trainer Card Pro.md](file:///C:/SecondMind/trainer-card-pro/docs/Trainer%20Card%20Pro.md) | — | Entrada principal e visão geral da arquitetura de abas. |
| [[Features]] | [Features.md](file:///C:/SecondMind/trainer-card-pro/docs/Features.md) | — | Persistência, temas e motor de regras/cálculos automáticos. |
| [[Types]] | [Types.md](file:///C:/SecondMind/trainer-card-pro/docs/Types.md) | [types.ts](file:///C:/SecondMind/trainer-card-pro/types.ts) | Modelagem de dados, estatísticas, itens e Pokémon. |
| [[Constants]] | [Constants.md](file:///C:/SecondMind/trainer-card-pro/docs/Constants.md) | [constants.ts](file:///C:/SecondMind/trainer-card-pro/constants.ts) | Valores padrões, temas de cores e perícias base do PTU. |
| [[Capabilities]] | [Capabilities.md](file:///C:/SecondMind/trainer-card-pro/docs/Capabilities.md) | [capabilities.ts](file:///C:/SecondMind/trainer-card-pro/src/data/capabilities.ts) | Tabelas e conversão estática de Força, Salto e Inteligência. |
| [[Estilos]] | [Estilos.md](file:///C:/SecondMind/trainer-card-pro/docs/Estilos.md) | [index.css](file:///C:/SecondMind/trainer-card-pro/index.css) | Cursores de Pokébola, efeitos hologramas e animações customizadas. |
| [[Stack Tecnológica]] | [Stack Tecnológica.md](file:///C:/SecondMind/trainer-card-pro/docs/Stack%20Tecnol%C3%B3gica.md) | [package.json](file:///C:/SecondMind/trainer-card-pro/package.json) | React 19, TypeScript, dependências de build, npm e Vite. |
| [[Sistema de Dados]] | [Sistema de Dados.md](file:///C:/SecondMind/trainer-card-pro/docs/Sistema%20de%20Dados.md) | — | Ciclo de vida, auto-save, migração profunda de localStorage e fluxo Equipe-PC. |

### 🧩 Componentes React (Núcleo)

| Nota Obsidian | 📁 Arquivo de Documentação (.md) | 💻 Arquivo de Código Fonte Correspondente | Descrição Curta |
|---|---|---|---|
| [[App]] | [App.md](file:///C:/SecondMind/trainer-card-pro/docs/App.md) | [App.tsx](file:///C:/SecondMind/trainer-card-pro/App.tsx) | Componente-mãe. Controla abas, modais, exportação e estados. |
| [[PokemonCreationSheet]] | [PokemonCreationSheet.md](file:///C:/SecondMind/trainer-card-pro/docs/PokemonCreationSheet.md) | [PokemonCreationSheet.tsx](file:///C:/SecondMind/trainer-card-pro/components/PokemonCreationSheet.tsx) | Formulário completo de criação rápida e detalhada de Pokémon. |
| [[TeamTab]] | [TeamTab.md](file:///C:/SecondMind/trainer-card-pro/docs/TeamTab.md) | [TeamTab.tsx](file:///C:/SecondMind/trainer-card-pro/components/TeamTab.tsx) | Controle dos 6 membros do time principal de combate. |
| [[PcTab]] | [PcTab.md](file:///C:/SecondMind/trainer-card-pro/docs/PcTab.md) | [PcTab.tsx](file:///C:/SecondMind/trainer-card-pro/components/PcTab.tsx) | Computador PC para armazenamento e swap de Pokémon em 99 caixas. |
| [[DerivedBox]] | [DerivedBox.md](file:///C:/SecondMind/trainer-card-pro/docs/DerivedBox.md) | [DerivedBox.tsx](file:///C:/SecondMind/trainer-card-pro/components/DerivedBox.tsx) | Cartão compacto para valores derivados (evasão, movimentos). |
| [[ImageCropper]] | [ImageCropper.md](file:///C:/SecondMind/trainer-card-pro/docs/ImageCropper.md) | [ImageCropper.tsx](file:///C:/SecondMind/trainer-card-pro/components/ImageCropper.tsx) | Recorte interativo quadrado 1:1 baseado no canvas HTML5. |
| [[InfoField]] | [InfoField.md](file:///C:/SecondMind/trainer-card-pro/docs/InfoField.md) | [InfoField.tsx](file:///C:/SecondMind/trainer-card-pro/components/InfoField.tsx) | Entrada de texto Pokédex para dados biográficos e de perfil. |
| [[SmartInput]] | [SmartInput.md](file:///C:/SecondMind/trainer-card-pro/docs/SmartInput.md) | [SmartInput.tsx](file:///C:/SecondMind/trainer-card-pro/components/SmartInput.tsx) | Input de calculadora matemática inline com sanitização robusta. |
| [[NotesTab]] | [NotesTab.md](file:///C:/SecondMind/trainer-card-pro/docs/NotesTab.md) | [NotesTab.tsx](file:///C:/SecondMind/trainer-card-pro/components/NotesTab.tsx) | Notas livres em formato de diário de campanha com suporte GFM. |

---

## 🧭 Fluxo de Edição / Modus Operandi (Para o Assistente de IA)

Ao receber solicitações de alteração de código, siga estritamente estas etapas para manter a integridade com zero desperdício de tokens:

1. **Localizar Código**: Encontre o arquivo de código fonte na coluna `Arquivo de Código Fonte` correspondente ao recurso solicitado.
2. **Localizar Nota**: Veja qual `.md` descreve este componente na coluna `Arquivo de Documentação`.
3. **Editar Código**: Realize a implementação do código com qualidade.
4. **Atualizar Documentação**: Abra imediatamente o arquivo `.md` correspondente usando o link de arquivo absoluto e atualize a especificação técnica de acordo com a modificação realizada.
5. **Registrar no Mapa**: Se um novo arquivo for criado, adicione uma nova entrada neste mapa principal imediatamente.

---

## 🏷️ Tags
#mapa #vault #obsidian #index #caminhos #performance
