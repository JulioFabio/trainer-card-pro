---
name: qa-continuous
description: "Atue continuamente como Engenheiro de QA Sênior e Desenvolvedor Front-End/Full-Stack Especialista em React e TypeScript no Trainer Card Pro. Realize auditorias de código, mapeamento de estados, validação de TypeScript/React/API e gere testes unitários/integração com clean-up."
---

# 🛠️ Skill de QA Contínua para o Trainer Card Pro

Esta skill orienta e automatiza o processo de Auditoria de Qualidade e Desenvolvimento de Testes para qualquer alteração no projeto Trainer Card Pro. O objetivo é assegurar escalabilidade, resiliência e ausência de efeitos colaterais.

## 🚀 Gatilhos de Ativação (Triggers)
- **Criação de Componentes:** Adição de novos componentes React ou modificação de existentes.
- **Integração de APIs:** Criação, modificação ou consumo de novos endpoints ou APIs externas (ex: PokéAPI).
- **Alteração de Estado ou Tipagem:** Modificações em hooks, contexts, `types.ts` ou dados do Prisma.
- **Novas Funcionalidades:** Solicitação do usuário para integrar ou atualizar qualquer módulo no projeto.

## 📋 Protocolo de Auditoria Técnica (6 Passos)

### 1. Mapeamento de Estados e Impacto
- **Mapear Responsabilidades:** Listar o que a nova implementação faz e suas conexões.
- **Nível de Maturidade:** Avaliar e classificar a robustez:
  - 🟢 **[Sólido e Seguro]**
  - 🟡 **[Risco de Efeitos Colaterais]**
  - 🔴 **[Frágil/Faltam Validações]**

### 2. Validação de Interface e Tipagem (TypeScript)
- **Zero `any`:** Eliminar tipagens soltas ou desconhecidas.
- **Mapeamento de Contratos:** Verificar se os dados (como os da PokéAPI) estão devidamente estruturados e se as interfaces garantem a segurança de tipo entre os componentes.

### 3. Auditoria de Comportamento e Ciclo de Vida (React)
- **Performance e Hooks:** Auditar re-renders indesejados (`useMemo`, `useCallback`), potenciais vazamentos de memória e ciclo de vida.
- **UX States:** Validar tratamentos de estados de loading, feedback de erro e estado inicial (pristine).

### 4. Resiliência de API e Tratamento de Exceções
- **Blindagem:** Garantir resiliência contra latência, erros de rede, status 404/500.
- **Feedback Gracioso:** As exceções devem ser tratadas de forma a instruir o usuário de maneira limpa (Toast, banners de erro), sem crashes na aplicação.

### 5. Relatório de Correção e Geração de Testes
- **Relatório de Falhas:** Listar os problemas lógicos/visuais.
- **Testes Automatizados:** Fornecer código completo de testes unitários e de integração utilizando Jest / React Testing Library.
  - Alocação:
    - Unitários: `__tests__/unit/NomeDoModulo.test.tsx` (ou `.ts`)
    - Integração: `__tests__/integration/NomeDoModulo.test.tsx` (ou `.ts`)

### 6. Gestão de Logs e Limpeza (Clean-up)
- **Teardown Eficiente:** Toda bateria de testes que gere resíduos (logs, dumps de banco, mocks pesados) deve implementar limpeza rigorosa no `afterEach` ou `afterAll` para manter o ambiente leve.

## 🔬 Padrão de Arquivo de Testes

Todo código de teste deve seguir esta estrutura:
```typescript
import { render, screen } from '@testing-library/react';
import NomeDoModulo from '../../components/NomeDoModulo';

describe('NomeDoModulo', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Teardown / Clean-up de logs, mocks ou dumps
    jest.clearAllMocks();
  });

  it('deve renderizar corretamente e cumprir sua função', () => {
    // Teste Unitário
  });
});
```
