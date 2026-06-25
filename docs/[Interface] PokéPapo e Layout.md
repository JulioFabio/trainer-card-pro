---
tags: [documentacao-viva, projeto, componentes, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-06-16
autor: "Antigravity"
---

# 💬 [Interface] PokéPapo e Layout

Este documento descreve a implementação do chat lateral retrátil (**PokéPapo**) e do cartão de rolagem de ataque (**AttackCard**), bem como sua integração no layout principal do aplicativo.

---

## 📝 Resumo

O PokéPapo é uma gaveta lateral retrátil (drawer) que fornece uma área de logs de combate, rolagem de dados e interações com o sistema. O design segue a estética retrô-futurista de Pokédex e responde dinamicamente à cor do tema ativo do aplicativo.

O AttackCard é uma representação compacta no estilo PTA 2.0 (Pokemon Tabletop Adventures) para a exibição de ataques no chat log, permitindo a rolagem rápida de testes de acurácia e dano diretamente a partir do log.

---

## 🔗 Conexões

- **Componente Principal:** [[App]] ([App.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/App.tsx))
- **Gaveta do Chat:** [[PokePapo]] ([PokePapo.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/PokePapo.tsx))
- **Card de Combate:** [[AttackCard]] ([AttackCard.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/components/AttackCard.tsx))
- **Temas Globais:** [[Constants]] ([constants.ts](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/constants.ts))

---

## ⚙️ Funcionamento e Comportamentos

### 1. Estado de Visibilidade e Layout Principal
No arquivo [App.tsx](file:///C:/Users/Julio/OneDrive/Documentos/Trainer-Card-Pro/trainer-card-pro/App.tsx), a gaveta PokéPapo é controlada pelo estado:
```typescript
const [isPokePapoOpen, setIsPokePapoOpen] = useState(false);
```

- **Estrutura Flex de Tela Cheia:** O layout principal ocupa toda a largura e altura disponíveis da tela, mantendo uma distância constante de `20px` (`p-[20px]`) em todas as bordas do navegador:
  ```html
  <div className="flex items-center justify-center h-full w-full">
    <!-- Pokedex Frame (flex-1) -->
    <!-- PokePapo Drawer (w-0 ou w-[444px] com transição suave) -->
  </div>
  ```
- **Botão de Ejeção:** Posicionado de forma absoluta no canto direito do painel de abas internas do frame principal da Pokédex (z-index 30), apresentando três risquinhos verticais. Clicar neste botão alterna o estado `isPokePapoOpen`.
- **Transição CSS:** A gaveta usa a classe `transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]` para animar suavemente a largura (`w-0` a `w-[380px]`) e a opacidade (`opacity-0` a `opacity-100`).

### 2. Estilização Dinâmica e Design Tecnológico
O componente `PokePapo` recebe o objeto `theme` (do tipo `PokedexTheme`) via props.
- **Acabamento do Painel:** O fundo e as bordas da gaveta externa são ajustados via estilo inline (`style={{ backgroundColor: theme.color }}`).
- **Filtro de Escurecimento do Cabeçalho:** O cabeçalho do PokéPapo possui o mesmo tom da carcaça do tema ativo, aplicando uma sobreposição escura semi-transparente (`bg-black/30`) para obter o mesmo tom de filtro do cabeçalho da Pokédex.
- **Design Sem Bordas Pretas ou Brancas:** Visando um visual perfeitamente limpo e tecnológico condizente com a ficha principal, foram removidas todas as bordas pretas grossas (`border-gray-800`) e bordas brancas sutis (`border-white/20`). A separação visual de blocos (tela, header, footer e input) agora é feita exclusivamente por sombras dinâmicas (ex: `shadow-[0_8px_30px_rgba(0,0,0,0.12)]`, `shadow-md` e `shadow-inner`).
- **Sobreposição e Preenchimento de Cantos:** Para evitar frestas transparentes nos cantos arredondados (`rounded-[2.5rem]`) da Pokédex principal (`z-20`), o painel de fundo do PokéPapo (`z-10`) é estendido em `64px` para a esquerda sob a Pokédex usando as classes `-ml-16` e `w-[444px]`. A compensação do alinhamento interno é feita com `pl-[72px]`, preenchendo o espaço de junção.
- Um LED indicador animado (`animate-pulse`) pisca no cabeçalho do chat, sinalizando que a conexão de sessão do PokéPapo está ativa.

### 3. AttackCard (Especificações de Props e Tipos)
O `AttackCard` é estruturado com base nas regras do sistema de RPG PTA 2.0:
- **name** (`string`): Nome da técnica (ex: "Bite").
- **type** (`string`): Tipo do movimento (ex: "Sombrio", "Água"). A cor do cabeçalho é resolvida dinamicamente através do mapeamento `TYPE_BG_CLASSES` com base no tipo.
- **frequency** (`string`): Frequência de uso (ex: "À Vontade", "Cena", "Encontro").
- **range** (`string`): Alcance (ex: "Corpo a Corpo", "1 Alvo, Racha").
- **damage** (`string`): Fórmula de dano (ex: "2d10+8").
- **category** (`'Físico' | 'Especial' | 'Status'`): Categoria de dano.
- **accuracy** (`string`): Acurácia requerida (ex: "AC 2").
- **db** (`string | number`, opcional): Damage Base.
- **descriptor** (`string`, opcional): Descritor adicional (ex: "Modéstia", "Recuo").
- **effect** (`string`): Efeito completo do movimento.
- **onRollAccuracy** (`() => void`): Callback para rolar o teste de acurácia (d20).
- **onRollDamage** (`() => void`): Callback para rolar o dano.

---

## ## Estado Atual e Próximos Passos

- [x] Construção do componente de gaveta `PokePapo.tsx` com transições CSS fluidas.
- [x] Construção do componente de rolagem de combate `AttackCard.tsx`.
- [x] Integração no layout principal `App.tsx` com o botão de ejeção lateral.
- [x] Adicionado mock demonstrativo de rolagem com o ataque "Bite" do Golisopod.
- [ ] Implementar motor real de processamento de comandos de dados (ex: `/roll 1d20+5`) no PokéPapo.
- [ ] Integrar os ataques reais cadastrados na ficha do Pokémon com botões de disparo automático para o PokéPapo.
