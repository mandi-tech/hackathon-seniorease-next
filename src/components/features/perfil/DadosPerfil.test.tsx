import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DadosPerfil from './DadosPerfil';
import * as AuthContext from '@/src/contexts/AuthContext';
import * as Navigation from 'next/navigation';

// Mock do next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock do hook useAuth
vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('DadosPerfil Component', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (Navigation.useRouter as any).mockReturnValue({
      push: mockPush,
    });
  });

  it('should render the loading state', () => {
    (AuthContext.useAuth as any).mockReturnValue({
      loading: true,
      profile: null,
      user: null,
      preferences: null,
    });

    const { container } = render(<DadosPerfil />);

    // O antd Spin é renderizado como uma div com classe 'ant-spin'
    const loadingElement = container.querySelector('.ant-spin');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should render profile and default accessibility preferences correctly', () => {
    (AuthContext.useAuth as any).mockReturnValue({
      loading: false,
      profile: {
        id: '123',
        name: 'Maria de Souza',
        email: 'maria@example.com',
        created_at: '2026-07-15T00:00:00Z',
      },
      user: {
        email: 'maria@example.com',
      },
      preferences: {
        user_id: '123',
        font_size: 'grande',
        contrast_level: true,
        high_element_spacing: false,
        ui_mode: false,
        visual_feedback: true,
        extra_confirm: true,
      },
    });

    render(<DadosPerfil />);

    // Verifica nome e email do perfil
    expect(screen.getByText('Maria de Souza')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();

    // Verifica rótulo/valores das preferências de acessibilidade
    // Tamanho da fonte grande = 'Grande'
    expect(screen.getByText('Grande')).toBeInTheDocument();

    // Contraste alto = 'Ativado' e Feedback Visual = 'Ativado'
    const activatedTags = screen.getAllByText('Ativado');
    expect(activatedTags).toHaveLength(2);

    // Modo de interface padrão = 'Modo Padrão' (ui_mode = false)
    expect(screen.getByText('Modo Padrão')).toBeInTheDocument();

    // Espaçamento confortável = 'Confortável' (high_element_spacing = false)
    expect(screen.getByText('Confortável')).toBeInTheDocument();

    // Segurança de exclusão extra_confirm = true -> 'Confirmação Exigida'
    expect(screen.getByText('Confirmação Exigida')).toBeInTheDocument();
  });

  it('should navigate to accessibility preferences page when edit button is clicked', () => {
    (AuthContext.useAuth as any).mockReturnValue({
      loading: false,
      profile: {
        id: '123',
        name: 'Maria de Souza',
        email: 'maria@example.com',
      },
      user: { email: 'maria@example.com' },
      preferences: {
        user_id: '123',
        font_size: 'padrao',
        contrast_level: false,
        high_element_spacing: false,
        ui_mode: false,
        visual_feedback: true,
        extra_confirm: false,
      },
    });

    render(<DadosPerfil />);

    const editButton = screen.getByRole('button', { name: /editar/i });
    expect(editButton).toBeInTheDocument();
    
    fireEvent.click(editButton);
    expect(mockPush).toHaveBeenCalledWith('/acessibilidade');
  });

  it('should render correct placeholder and fallback message when no preferences are set', () => {
    (AuthContext.useAuth as any).mockReturnValue({
      loading: false,
      profile: null,
      user: null,
      preferences: null,
    });

    render(<DadosPerfil />);

    // Deve exibir o nome padrão
    expect(screen.getByText('Usuário SeniorEase')).toBeInTheDocument();
    expect(screen.getByText('Sem e-mail cadastrado')).toBeInTheDocument();

    // Deve exibir a mensagem de que não há preferências
    expect(screen.getByText('Nenhuma preferência de acessibilidade configurada.')).toBeInTheDocument();
  });
});
