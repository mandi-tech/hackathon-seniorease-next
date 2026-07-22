import { test, expect } from "@playwright/test";

test.describe("Login flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "unauthorized" }),
      });
    });

    await page.route("**/auth/v1/session*", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "unauthorized" }),
      });
    });
  });

  test("should show error notification when entering invalid credentials", async ({
    page,
  }) => {
    await page.route("**/auth/v1/token*", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "E-mail ou senha incorretos.",
        }),
      });
    });

    await page.goto("/login");

    await page.fill('input[type="email"]', "invalido@seniorease.com");
    await page.fill('input[type="password"]', "senhaerrada");

    await page.click('button:has-text("Entrar")');

    const errorNotice = page.locator(".ant-notification-notice-error");
    await expect(errorNotice).toBeVisible();
    await expect(errorNotice).toContainText("Erro no login");
  });

  test("should successfully log in and redirect to dashboard when user has preferences configured", async ({
    page,
  }) => {
    await page.route("**/auth/v1/token*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "valid-mock-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "valid-mock-refresh",
          user: {
            id: "mock-user-id-123",
            email: "teste@seniorease.com",
            user_metadata: { name: "Usuário de Teste" },
          },
        }),
      });
    });

    await page.route("**/rest/v1/profiles*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "mock-user-id-123",
            name: "Usuário de Teste",
            email: "teste@seniorease.com",
          },
        ]),
      });
    });

    await page.route("**/rest/v1/user_preferences*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            user_id: "mock-user-id-123",
            font_size: "grande",
            contrast_level: false,
            high_element_spacing: false,
            ui_mode: false,
            visual_feedback: true,
            extra_confirm: false,
            has_configured: true,
          },
        ]),
      });
    });

    await page.goto("/login");

    await page.fill('input[type="email"]', "teste@seniorease.com");
    await page.fill('input[type="password"]', "senhasegura123");

    await page.click('button:has-text("Entrar")');

    await page.waitForURL("**/");
    expect(page.url()).toBe("http://localhost:3000/");
  });
});
