# 💻 Stack Tecnológica

> Especificação de tecnologias, pacotes, compilação e configurações do ecossistema do [[Trainer Card Pro]].

---

## 🛠️ Núcleo Tecnológico

O aplicativo é desenvolvido como uma **Single Page Application (SPA)** moderna, rápida e altamente otimizada:

1. **React 19 (v19.2.3)**: Biblioteca de UI robusta focada em componentes reutilizáveis, gerenciamento de estado local reativo e hooks avançados (`useMemo`, `useCallback`, `useEffect`).
2. **TypeScript (~v5.8.2)**: Fornece tipagem estática e segura para todo o fluxo de dados do personagem e dos Pokémon (veja [[Types]]).
3. **Tailwind CSS (v3.4.1)**: Framework CSS utilitário para estilização rápida, responsiva e moderna, integrando facilidades como gradientes complexos e efeitos hologramas (veja [[Estilos]]).
4. **Vite (v6.2.0)**: Ferramenta de build ultra-rápida de próxima geração que substitui o antigo webpack, provendo Hot Module Replacement (HMR) quase instantâneo em desenvolvimento e build de produção altamente otimizado por Rollup.

---

## 📦 Dependências Externas (`package.json`)

As bibliotecas complementares instaladas no projeto resolvem demandas específicas de UI e manipulação de arquivos:

| Pacote | Versão | Função Principal | Referência |
|---|---|---|---|
| **`react-easy-crop`** | `^5.5.6` | Recortador de imagem interativo quadrado em Canvas para fotos e avatares | [[ImageCropper]] |
| **`react-markdown`** | `^10.1.0` | Converte texto puro em elementos React estruturados com segurança | [[NotesTab]] |
| **`remark-gfm`** | `^4.0.1` | Adiciona tabelas, links e checklists ao interpretador Markdown | [[NotesTab]] |
| **`@tailwindcss/typography`** | `^0.5.19` | Plugin utilitário do Tailwind para estilizar automaticamente blocos HTML gerados por Markdown | [[NotesTab]] |

---

## ⚙️ Configurações de Compilação e Build

### 1. Vite (`vite.config.ts`)
- **Porta**: Configurado estritamente para rodar localmente na porta `3000` (`host: 0.0.0.0` para permitir acesso por dispositivos móveis na mesma rede local).
- **Aliases**: Mapeamento do caractere `@` para o diretório raiz do projeto para simplificar importações de arquivos.

### 2. Tailwind (`tailwind.config.js`)
- **Varredura**: Configurado para ler arquivos HTML na raiz e recursivamente vasculhar todos os arquivos de extensão `.js`, `.ts`, `.jsx` e `.tsx` sob a pasta `src` e subdiretórios para purgar CSS não utilizado na build final.
- **Plugins**: Injeta `@tailwindcss/typography` como dependência direta do sistema de compilação.

---

## 🚀 Como Rodar o Projeto Localmente

Os scripts listados no `package.json` gerenciam o ciclo de vida do projeto usando o gerenciador Node.js:

### Desenvolvimento Local
Para iniciar o servidor dev de recarga rápida:
```bash
npm run dev
```
Acesse no navegador através de: `http://localhost:3000`.

### Build de Produção
Para compilar e otimizar todo o código TypeScript e CSS em arquivos estáticos minificados sob a pasta `dist/` pronta para deploy:
```bash
npm run build
```

---

## 🏷️ Tags
#tecnologia #react #vite #typescript #tailwind #configuracoes #build
