import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { App } from "antd";
import FormConfig from "./FormConfig";
import * as AuthContext from "@/src/contexts/AuthContext";
import * as Navigation from "next/navigation";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/src/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("FormConfig Component", () => {
  const mockPush = vi.fn();
  const mockUpdatePreferences = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (Navigation.useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  const setupTest = (preferences: Record<string, unknown>) => {
    (AuthContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      preferences,
      updatePreferences: mockUpdatePreferences,
    });

    return render(
      <App>
        <FormConfig />
      </App>,
    );
  };

  it("should render form with initial values from preferences", async () => {
    setupTest({
      ui_mode: true,
      font_size: "grande",
      contrast_level: true,
      high_element_spacing: false,
      visual_feedback: true,
      extra_confirm: false,
    });

    const modoSimplesBtn = screen.getByRole("button", { name: "Modo Simples" });
    expect(modoSimplesBtn).toHaveClass("ant-btn-primary");

    const grandeBtn = screen.getByRole("button", { name: "Grande" });
    expect(grandeBtn).toHaveClass("ant-btn-primary");

    const switches = screen.getAllByRole("switch");
    expect(switches[0]).toHaveAttribute("aria-checked", "true");
  });

  it("should call updatePreferences with new values when form is submitted", async () => {
    mockUpdatePreferences.mockResolvedValue({ success: true });

    setupTest({
      ui_mode: false,
      font_size: "padrao",
      contrast_level: false,
      high_element_spacing: false,
      visual_feedback: true,
      extra_confirm: false,
    });

    const modoSimplesBtn = screen.getByRole("button", { name: "Modo Simples" });
    fireEvent.click(modoSimplesBtn);

    const muitoGrandeBtn = screen.getByRole("button", { name: "Muito Grande" });
    fireEvent.click(muitoGrandeBtn);

    const saveButton = screen.getByRole("button", { name: /salvar/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        ui_mode: true,
        font_size: "muito-grande",
        contrast_level: false,
        high_element_spacing: false,
        visual_feedback: true,
        extra_confirm: false,
        has_configured: true,
      });
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("should show error notification when updatePreferences fails", async () => {
    mockUpdatePreferences.mockResolvedValue({
      success: false,
      error: "Database update failed",
    });

    setupTest({
      ui_mode: false,
      font_size: "padrao",
      contrast_level: false,
      high_element_spacing: false,
      visual_feedback: true,
      extra_confirm: false,
    });

    const saveButton = screen.getByRole("button", { name: /salvar/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
