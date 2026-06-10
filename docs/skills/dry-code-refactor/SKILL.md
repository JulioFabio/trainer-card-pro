---
name: dry-code-refactor
description: >-
  Protocolo de identificação e refatoração de código duplicado (DRY) na camada de rede, deserialização de banco de dados e componentização genérica do React.
---

# Refatoração DRY e Componentização Genérica

## Overview

Esta habilidade ensina o processo de auditoria estática e saneamento de padrões duplicados no código, unificando lógicas repetidas em helpers no backend e genericizando componentes no frontend para maximizar a reutilização sob a ótica do princípio DRY (Don't Repeat Yourself).

---

## Protocolo de Refatoração

### 1. Centralização de Roteamento e Parâmetros de API
Quando múltiplas rotas de API leem ou deletam entidades por ID, a lógica de validação de URL se repete. Substitua os blocos redundantes por um helper centralizado:

#### Gabarito do Helper (`lib/routeHelpers.ts`)
```typescript
import { NextResponse } from 'next/server';

export function getQueryParam(request: Request, name: string): string | null {
  const { searchParams } = new URL(request.url);
  return searchParams.get(name);
}

export function requireQueryParam(request: Request, name: string, customError?: string) {
  const value = getQueryParam(request, name);
  if (!value) {
    return {
      value: null,
      response: NextResponse.json(
        { error: customError || `O parâmetro '${name}' é obrigatório` },
        { status: 400 }
      )
    };
  }
  return { value, response: null };
}
```

#### Como Aplicar na Rota
```typescript
import { requireQueryParam } from '@/lib/routeHelpers';

export const GET = async (request: Request) => {
  const { value: id, response } = requireQueryParam(request, 'id', 'ID inválido');
  if (response) return response; // Retorna 400 automaticamente
  
  // Executa lógica com id...
};
```

---

### 2. Conversão Segura de Colunas do Banco (JSON)
Campos textuais salvos em formato de string JSON no SQLite causam a duplicação de blocos `try-catch` repetitivos a cada leitura. Unifique essa conversão em um helper genérico:

#### Gabarito do Helper (`lib/json.ts`)
```typescript
export function safeParseJson<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}
```

#### Como Aplicar na Leitura de Dados
```typescript
import { safeParseJson } from '@/lib/json';

const parsedCharacter = {
  ...character,
  sheetData: safeParseJson(character.sheetData, {}),
  pokemons: character.pokemons.map(p => ({
    ...p,
    pokemonData: safeParseJson(p.pokemonData, {})
  }))
};
```

---

### 3. Genericização de Componentes de Formulário (React + TS)
Evite acoplar componentes de entrada (como inputs ou cards de dados) a interfaces de tipos específicas (como `TrainerData`). Componentes visuais devem ser agnósticos a domínio.

#### Gabarito de Componente Genérico (`components/GenericInput.tsx`)
```typescript
import React from 'react';

interface InfoFieldProps<T> {
  label: string;
  value: string | number;
  field: T;
  onChange: (field: T, value: any) => void;
  themeColor: string;
}

export function InfoField<T>({ label, value, field, onChange, themeColor }: InfoFieldProps<T>) {
  return (
    <div className="flex border rounded p-2">
      <span style={{ color: themeColor }}>{label}</span>
      <input 
        value={value} 
        onChange={(e) => onChange(field, e.target.value)} 
      />
    </div>
  );
}
```

---

## Common Mistakes

- **Quebras de Tipo Implícitas**: Ao transformar um componente em genérico (`<T>`), esquecer de digitar a prop `field` como `T`. Isso faz com que o TypeScript infira `any` e anule os benefícios de segurança estática.
- **Modificações não Verificadas**: Fazer refatorações estruturais em rotas de API sem executar testes de regressão automatizados para certificar que a assinatura da resposta JSON não sofreu alterações indesejadas.
