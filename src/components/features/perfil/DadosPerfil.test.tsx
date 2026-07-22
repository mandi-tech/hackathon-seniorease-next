import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DadosPerfil from "./DadosPerfil";
import * as AuthContext from "@/src/contexts/AuthContext";
import * as Navigation from "next/navigation";
import type { User } from "@supabase/supabase-js";

// Mock do next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock do hook useAuth
vi.mock("@/src/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("DadosPerfil Component", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Navigation.useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  it("should render the loading state", () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      loading: true,
      profile: null,
      user: null,
      preferences: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updatePreferences: vi.fn(),
      updateProfile: vi.fn(),
    });

    const { container } = render(<DadosPerfil />);

    const loadingElement = container.querySelector(".ant-spin");
    expect(loadingElement).toBeInTheDocument();
  });

  it("should render profile and default accessibility preferences correctly", () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      loading: false,
      profile: {
        id: "123",
        name: "Maria de Souza",
        email: "maria@example.com",
        created_at: "2026-01-01",
      },
      user: { id: "123", email: "maria@example.com" } as unknown as User,
      preferences: {
        user_id: "123",
        font_size: "padrao",
        contrast_level: false,
        high_element_spacing: false,
        ui_mode: false,
        visual_feedback: true,
        extra_confirm: true,
      },
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updatePreferences: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(<DadosPerfil />);

    expect(screen.getByText("Maria de Souza")).toBeInTheDocument();
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
    expect(screen.getByText("Confirmação Exigida")).toBeInTheDocument();
  });

  it("should navigate to accessibility preferences page when edit button is clicked", () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      loading: false,
      profile: {
        id: "123",
        name: "Maria de Souza",
        email: "maria@example.com",
        created_at: "2026-01-01",
      },
      user: { id: "123", email: "maria@example.com" } as unknown as User,
      preferences: {
        user_id: "123",
        font_size: "padrao",
        contrast_level: false,
        high_element_spacing: false,
        ui_mode: false,
        visual_feedback: true,
        extra_confirm: false,
      },
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updatePreferences: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(<DadosPerfil />);

    const editButton = screen.getByRole("button", { name: /^editar$/i });
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(mockPush).toHaveBeenCalledWith("/acessibilidade");
  });

  it("should render correct placeholder and fallback message when no preferences are set", () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      loading: false,
      profile: null,
      user: null,
      preferences: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updatePreferences: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(<DadosPerfil />);

    expect(screen.getByText("Usuário SeniorEase")).toBeInTheDocument();
    expect(screen.getByText("Sem e-mail cadastrado")).toBeInTheDocument();
    expect(
      screen.getByText("Nenhuma preferência de acessibilidade configurada."),
    ).toBeInTheDocument();
  });
});
