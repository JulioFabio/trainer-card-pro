# 📦 DerivedBox

> Componente de exibição compacto para estatísticas derivadas e calculadas.
> Arquivo: `components/DerivedBox.tsx` — **21 linhas**
> Usado em: [[App#Aba Treinador]], [[App#Aba Combate]], [[PokemonCreationSheet#Sub-aba Capacidades]]

---

## Props

```typescript
interface DerivedBoxProps {
  label: string;      // Rótulo da estatística (ex: "Evasão Física")
  value: number;      // Valor calculado
  icon: string;       // Ícone do Font Awesome (ex: "fa-shield-halved")
  color: string;      // Cor de fundo do ícone em formato hex
}
```

---

## Estrutura do Componente

O componente é um componente funcional puro (stateless) que renderiza um layout compacto:

```
┌──────────────────────────────────────────────┐
│ [Icon]  LABEL (Uppercase, tiny, muted)       │
│  (1:1)  VALUE (Large, bold, dark)            │
└──────────────────────────────────────────────┘
```

- **Container Principal**: Fundo branco, borda preta espessa (`border-2 border-black`), cantos arredondados (`rounded-2xl`), sombra simulada retrô (`shadow-[2px_2px_0px_rgba(0,0,0,0.1)]`) e animação suave ao pairar (`hover:scale-105 transition-transform`).
- **Quadrado do Ícone**: Tamanho fixo `w-8 h-8`, cantos `rounded-xl`, centralizado com `shrink-0`, ícone branco e cor de fundo dinâmica baseada na prop `color` (`style={{ backgroundColor: color }}`).
- **Conteúdo de Texto**:
  - `label`: Caixa alta (`uppercase`), extra-bold (`font-black`), fonte minúscula `text-[8px]` na cor cinza suave (`text-zinc-400`) com espaçamento expandido (`tracking-widest`).
  - `value`: Fonte preta extra-bold (`font-black`), tamanho `text-xl` na cor escura (`text-zinc-900`).

---

## Estilo e Animações

```css
/* Efeito de hover suave no container */
.group:hover {
  transform: scale(1.05);
}
```

---

## 🏷️ Tags
#componente #apresentacao #ui #derived #retro
