/**
 * @file __tests__/unit/loginScreen.test.tsx
 * @description Testes unitários para a tela de login manual e guard de sessão.
 * Valida os 3 estados do guard (loading, unauthenticated, authenticated)
 * e o formulário de login direto dos Treinadores/GM.
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────────
const { mockUseSession, mockSignIn } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
  mockSignIn: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signIn: (...args: any[]) => mockSignIn(...args),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock do App.tsx para evitar carregar toda a árvore de dependências
vi.mock('@/App', () => ({
  default: function MockApp() {
    return <div data-testid="mock-app">App Loaded</div>;
  },
}));

import { render, screen, fireEvent } from '@testing-library/react';
import Home from '@/app/page';

describe('LoginScreen & Session Guard (page.tsx)', () => {
  beforeEach(() => {
    mockUseSession.mockReset();
    mockSignIn.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ──────────────────────────────────────────────────
  // 1. Guard de Sessão — Estado de Loading
  // ──────────────────────────────────────────────────
  describe('Estado: Loading (verificando sessão)', () => {
    it('deve exibir a tela de loading com texto "Carregando Pokédex..."', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'loading' });
      render(<Home />);

      expect(screen.getByText('Carregando Pokédex...')).toBeDefined();
    });

    it('não deve renderizar o App enquanto estiver carregando', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'loading' });
      render(<Home />);

      expect(screen.queryByTestId('mock-app')).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────
  // 2. Guard de Sessão — Estado Unauthenticated
  // ──────────────────────────────────────────────────
  describe('Estado: Unauthenticated (sem sessão)', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    });

    it('deve exibir o título "Trainer Card Pro"', () => {
      render(<Home />);
      expect(screen.getByText(/Trainer Card/i)).toBeDefined();
      expect(screen.getByText(/Pro/i)).toBeDefined();
    });

    it('deve renderizar o formulário de login direto', () => {
      render(<Home />);
      expect(screen.getByPlaceholderText('Ex: Ash Ketchum')).toBeDefined();
      expect(screen.getByText('Entrar na Campanha')).toBeDefined();
    });

    it('não deve conter referências ao login do Discord', () => {
      render(<Home />);
      expect(screen.queryByText('Entrar com Discord')).toBeNull();
    });

    it('não deve renderizar o App quando não autenticado', () => {
      render(<Home />);
      expect(screen.queryByTestId('mock-app')).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────
  // 3. Guard de Sessão — Estado Authenticated
  // ──────────────────────────────────────────────────
  describe('Estado: Authenticated (sessão ativa)', () => {
    it('deve renderizar o App quando autenticado', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user_1', name: 'Ash', role: 'PLAYER' } },
        status: 'authenticated',
      });
      render(<Home />);

      expect(screen.getByTestId('mock-app')).toBeDefined();
      expect(screen.getByText('App Loaded')).toBeDefined();
    });

    it('não deve exibir a tela de login quando autenticado', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user_1', name: 'Ash', role: 'PLAYER' } },
        status: 'authenticated',
      });
      render(<Home />);

      expect(screen.queryByText('Entrar na Campanha')).toBeNull();
      expect(screen.queryByText('Carregando Pokédex...')).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────
  // 4. Submissão do Formulário Manual
  // ──────────────────────────────────────────────────
  describe('Submissão do Formulário de Treinador', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    });

    it('deve manter o botão "Entrar na Campanha" desabilitado sem nome', () => {
      render(<Home />);
      const submitBtn = screen.getByText('Entrar na Campanha');
      expect(submitBtn.closest('button')?.disabled).toBe(true);
    });

    it('deve habilitar o botão após digitar o nome', () => {
      render(<Home />);
      const nameInput = screen.getByPlaceholderText('Ex: Ash Ketchum');
      fireEvent.change(nameInput, { target: { value: 'Misty' } });

      const submitBtn = screen.getByText('Entrar na Campanha');
      expect(submitBtn.closest('button')?.disabled).toBe(false);
    });

    it('deve chamar signIn("credentials") com os dados preenchidos', () => {
      render(<Home />);
      const nameInput = screen.getByPlaceholderText('Ex: Ash Ketchum');
      fireEvent.change(nameInput, { target: { value: 'Brock' } });

      fireEvent.click(screen.getByText('Entrar na Campanha'));

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        username: 'Brock',
        email: undefined,
        role: 'PLAYER',
        redirect: false,
      });
    });

    it('deve permitir seleção de cargo de Mestre (GM)', () => {
      render(<Home />);
      const nameInput = screen.getByPlaceholderText('Ex: Ash Ketchum');
      fireEvent.change(nameInput, { target: { value: 'Oak' } });

      fireEvent.click(screen.getByText('Mestre (GM)'));
      fireEvent.click(screen.getByText('Entrar na Campanha'));

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        username: 'Oak',
        email: undefined,
        role: 'GM',
        redirect: false,
      });
    });
  });
});
