import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ModalEditarPerfil from "./ModalEditarPerfil";
import * as AuthContext from "@/src/contexts/AuthContext";
import { App } from "antd";

vi.mock("@/src/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("ModalEditarPerfil Component", () => {
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      loading: false,
      profile: {
        id: "123",
        name: "Maria de Souza",
        email: "maria@example.com",
        created_at: "2026-01-01",
      },
      user: {
        id: "123",
        email: "maria@example.com",
      } as unknown as import("@supabase/supabase-js").User,
      preferences: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updatePreferences: vi.fn(),
      updateProfile: mockUpdateProfile,
    });
  });

  it("should render trigger button and open modal when clicked", async () => {
    render(
      <App>
        <ModalEditarPerfil />
      </App>,
    );

    const triggerBtn = screen.getByRole("button", { name: /editar dados/i });
    expect(triggerBtn).toBeInTheDocument();

    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(screen.getByText("Editar Dados do Perfil")).toBeInTheDocument();
    });
  });

  it("should call updateProfile when form is submitted with valid data", async () => {
    mockUpdateProfile.mockResolvedValue({ success: true });

    render(
      <App>
        <ModalEditarPerfil open={true} />
      </App>,
    );

    const saveBtn = screen.getByRole("button", { name: /salvar alterações/i });
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: "Maria de Souza",
        email: "maria@example.com",
        password: undefined,
      });
    });
  });
});
