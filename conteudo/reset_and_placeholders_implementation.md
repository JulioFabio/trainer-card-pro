# Documentação Técnica: Dados Pristinos e Placeholders Dinâmicos (Informações Fantasmas)

Este documento descreve a especificação, arquitetura e fluxo de implementação aplicada à ficha de Treinador para o **Layout de Informações Fantasmas (Placeholders Dinâmicos)**.

---

## 1. Visão Geral da Melhoria

Para obter um banco de dados limpo e profissional por padrão, removemos as informações fictícias do personagem padrão ("Carlos") do banco SQLite inicial e do cache local. 

Agora, a ficha é inicializada e resetada completamente zerada/vazia, mas exibe dicas translúcidas e inteligentes (placeholders fantasmas) que servem de exemplo de preenchimento para guiar o usuário sem poluir as tabelas do banco de dados com dados de teste.

---

## 2. Especificação do Layout de Informações Fantasmas (Placeholders)

Limpamos todas as propriedades de `INITIAL_TRAINER_DATA` no arquivo **[constants.ts](file:///c:/Users/Julio/OneDrive/Documentos/TrabalhoNewton/trainer-card-pro-ImprovePcTab/constants.ts)**. 

### 2.1 Extensão de Propriedades do `InfoField`
Para viabilizar placeholders nos campos biográficos customizados, adicionamos a propriedade opcional `placeholder` no componente **[InfoField.tsx](file:///c:/Users/Julio/OneDrive/Documentos/TrabalhoNewton/trainer-card-pro-ImprovePcTab/components/InfoField.tsx)**:
```typescript
interface InfoFieldProps {
  label: string;
  value: string | number;
  field: keyof TrainerData;
  type?: string;
  onChange: (field: keyof TrainerData, value: string | number) => void;
  themeColor: string;
  placeholder?: string; // Propriedade opcional de UX
}
```
No input nativo do `InfoField`, aplicamos classes HSL com opacidade reduzida (`placeholder-zinc-400/60`) para renderizar o efeito "fantasma" translúcido ideal:
```tsx
<input 
  type={type} 
  value={value || ''} 
  onChange={(e) => onChange(field, type === "number" ? parseInt(e.target.value) || 0 : e.target.value)} 
  placeholder={placeholder}
  className="w-full bg-transparent px-2 text-xs font-black italic text-zinc-900 placeholder-zinc-400/60 outline-none" 
/>
```

### 2.2 Lista de Placeholders Guia Mapeados

Mapeamos placeholders realistas que auxiliam o usuário a entender como preencher cada campo, mantendo a tela preenchida de forma harmoniosa enquanto o banco estiver vazio:

- **Nome de Identidade**: `"Ex: Carlos"`
- **Frase/Conceito**: `"Ex: Gotta catch'em all!"`
- **Nível Geral**: `"1"` (padrão)
- **Idade**: `"Ex: 16"`
- **Gênero**: `"Ex: Masculino"`
- **Peso**: `"Ex: 60kg"`
- **Altura**: `"Ex: 1,64"`
- **Naturalidade**: `"Ex: Pallet Town"`
- **Jogador**: `"Ex: Tulio"`
- **Campanha**: `"Ex: - (Liga)"`
- **Classes de Carreira (1 a 4)**: `"Ex: Captor"`, `"Ex: Colecionador"`, `"Ex: Pokebolista"`, `"Ex: Engenheiro"`

---

## 3. Dicas de Ouro para Futuras Reimplementações ou Extensões

Se você precisar evoluir estes sistemas ou adicionar novos campos futuramente, siga estas diretrizes:

### 💡 1. Adicionando Novos Campos com Dicas Fantasmas
Ao criar novos formulários ou inputs na Pokédex (ex: detalhes de combate, histórico de ginásio ou itens da mochila):
1. Sempre defina a propriedade inicial correspondente em `INITIAL_TRAINER_DATA` (no `constants.ts`) como vazia (`''`, `0` ou `[]`).
2. Adicione um placeholder realista no formato `"Ex: [Valor Fictício]"` diretamente no elemento HTML de input.
3. Utilize a cor de placeholder tailwind `placeholder-zinc-400/60` ou `placeholder-white/40` dependendo se o fundo for claro ou escuro (cor do tema) para garantir o visual translúcido uniforme.
