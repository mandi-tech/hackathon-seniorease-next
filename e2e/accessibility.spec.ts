import { test, expect } from "@playwright/test";

test.describe("Accessibility preferences and flow", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) =>
      console.log(`BROWSER [${msg.type()}]:`, msg.text()),
    );
    page.on("pageerror", (err) => console.error("BROWSER ERROR:", err.message));

    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "mock-user-id-123",
          email: "teste@seniorease.com",
          user_metadata: { name: "Usuário de Teste" },
        }),
      });
    });

    await page.route("**/auth/v1/session*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "valid-mock-token",
          user: {
            id: "mock-user-id-123",
            email: "teste@seniorease.com",
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
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              user_id: "mock-user-id-123",
              font_size: "padrao",
              contrast_level: false,
              high_element_spacing: false,
              ui_mode: false,
              visual_feedback: true,
              extra_confirm: false,
              has_configured: false,
            },
          ]),
        });
      } else if (method === "PATCH" || method === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user_id: "mock-user-id-123",
            font_size: "muito-grande",
            contrast_level: true,
            high_element_spacing: true,
            ui_mode: true,
            visual_feedback: true,
            extra_confirm: true,
            has_configured: true,
          }),
        });
      }
    });
  });

  test("should redirect unconfigured users to /acessibilidade and allow them to configure preferences", async ({
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

    await page.goto("/login");
    await page.fill('input[type="email"]', "teste@seniorease.com");
    await page.fill('input[type="password"]', "senhasegura123");
    await page.click('button:has-text("Entrar")');

    await page.waitForURL("**/acessibilidade");
    expect(page.url()).toContain("/acessibilidade");

    const title = page.locator("h3").filter({ hasText: "Modo de Interface" });
    await expect(title).toBeVisible();

    await page.click('button:has-text("Modo Simples")');

    await page.click('button:has-text("Muito Grande")');

    const switches = page.locator(".ant-switch");
    await expect(switches.first()).toBeVisible();
    await switches.first().click();

    await page.click('button:has-text("Salvar")');

    await page.waitForURL("**/");
    expect(page.url()).toBe("http://localhost:3000/");

    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveAttribute("data-font-size", "extra-large");
    await expect(htmlElement).toHaveAttribute("data-contrast", "high");
    await expect(htmlElement).toHaveAttribute("data-ui-mode", "simple");
  });
});
