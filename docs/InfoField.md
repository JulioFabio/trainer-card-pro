---
tags: [documentacao-viva, projeto, componentes, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-06-15
autor: "Antigravity"
---

# 📝 InfoField

> Campo de entrada de texto ou número estilizado em formato de Pokédex retrô.
> Arquivo: `components/InfoField.tsx` — **28 linhas**
> Usado em: [[App#Aba Treinador]]

---

## Props

```typescript
interface InfoFieldProps<T> {
  label: string;                                              // Rótulo em destaque
  value: string | number;                                     // Valor do input
  field: T;                                                   // Tipo genérico do campo associado
  type?: string;                                              // Tipo do input HTML (default: "text")
  onChange: (field: T, value: any) => void;                   // Callback de atualização genérica
  themeColor: string;                                         // Cor tema em hexadecimal
  placeholder?: string;                                       // Placeholder descritivo opcional
}
```

---

## Estrutura do Layout

```
┌──────────────────────────────────────────────┐
│ LABEL (Themed bg, white, italic) ┇ INPUT     │
└──────────────────────────────────────────────┘
```

O container é construído como uma linha flexível (`flex border-2 border-black rounded-xl overflow-hidden min-h-[2.5rem] bg-white`):
- **Seção do Rótulo (Esquerda)**: Largura fixa de 80px (`w-20 min-w-[5rem]`), centralizada, com a cor de fundo definida dinamicamente via inline style pelo `themeColor`.
  - O texto é renderizado com `text-[9px] font-black italic uppercase text-white tracking-tighter drop-shadow-sm` para garantir legibilidade contra cores vibrantes.
  - A separação com a área de input é feita por uma linha pontilhada escura (`border-r-2 border-black border-dotted`).
- **Seção do Input (Direita)**: Área flexível contendo um elemento `<input />` estilizado sem bordas padrão (`bg-transparent outline-none w-full px-2 text-xs font-black italic text-zinc-900`).

---

## Comportamento de Mudança (Parsing)

O handler de mudança verifica o tipo do campo para converter valores numéricos adequadamente de forma a evitar que strings que representam números sejam salvas como string no estado global de [[Types#TrainerData|TrainerData]]:

```typescript
onChange={(e) => onChange(
  field, 
  type === "number" ? parseInt(e.target.value) || 0 : e.target.value
)}
```

---

## Efeitos Visuais
- **Hover**: Aplica um leve brilho no campo inteiro (`hover:brightness-110 transition-all shadow-[1px_1px_0px_rgba(0,0,0,0.1)]`).
- **Transição de Tema**: A transição de cores do rótulo ao trocar de tema de cores ocorre de forma suave em 500ms (`transition-colors duration-500`).

---

## 🏷️ Tags
#componente #biografia #input #formulario #retro
