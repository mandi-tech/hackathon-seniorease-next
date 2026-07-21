import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from 'antd';
import FormConfig from './FormConfig';
import * as AuthContext from '@/src/contexts/AuthContext';
import * as Navigation from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock useAuth hook
vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('FormConfig Component', () => {
  const mockPush = vi.fn();
  const mockUpdatePreferences = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (Navigation.useRouter as any).mockReturnValue({
      push: mockPush,
    });
  });

  const setupTest = (preferences: any) => {
    (AuthContext.useAuth as any).mockReturnValue({
      preferences,
      updatePreferences: mockUpdatePreferences,
    });

    return render(
      <App>
        <FormConfig />
      </App>
    );
  };

  it('should render form with initial values from preferences', async () => {
    setupTest({
      ui_mode: true, // Modo Simples
      font_size: 'grande', // Grande
      contrast_level: true, // Contraste alto
      high_element_spacing: false, // Confortável
      visual_feedback: true,
      extra_confirm: false,
    });

    // Modo Simples button should be primary type
    const modoSimplesBtn = screen.getByRole('button', { name: 'Modo Simples' });
    expect(modoSimplesBtn).toHaveClass('ant-btn-primary');

    // Grande button should be primary type
    const grandeBtn = screen.getByRole('button', { name: 'Grande' });
    expect(grandeBtn).toHaveClass('ant-btn-primary');

    // High Contrast Switch should be checked (index 0 of the three switches)
    const switches = screen.getAllByRole('switch');
    expect(switches[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('should call updatePreferences with new values when form is submitted', async () => {
    mockUpdatePreferences.mockResolvedValue({ success: true });
    
    setupTest({
      ui_mode: false,
      font_size: 'padrao',
      contrast_level: false,
      high_element_spacing: false,
      visual_feedback: true,
      extra_confirm: false,
    });

    // Mudar Modo de Interface para "Modo Simples"
    const modoSimplesBtn = screen.getByRole('button', { name: 'Modo Simples' });
    fireEvent.click(modoSimplesBtn);

    // Mudar tamanho da fonte para "Muito Grande"
    const muitoGrandeBtn = screen.getByRole('button', { name: 'Muito Grande' });
    fireEvent.click(muitoGrandeBtn);

    // Submeter form
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        ui_mode: true,
        font_size: 'muito-grande',
        contrast_level: false,
        high_element_spacing: false,
        visual_feedback: true,
        extra_confirm: false,
        has_configured: true,
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should show error notification when updatePreferences fails', async () => {
    mockUpdatePreferences.mockResolvedValue({ success: false, error: 'Database update failed' });
    
    setupTest({
      ui_mode: false,
      font_size: 'padrao',
      contrast_level: false,
      high_element_spacing: false,
      visual_feedback: true,
      extra_confirm: false,
    });

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalled();
      // O router.push não deve ter sido chamado em caso de falha
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
