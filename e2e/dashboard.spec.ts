import { test, expect } from '@playwright/test';

test.describe('Dashboard tasks page', () => {
  test.beforeEach(async ({ page }) => {
    // Log console messages and errors
    page.on('console', msg => console.log(`BROWSER [${msg.type()}]:`, msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

    // Intercepter chamadas ao Supabase para simular usuário logado e configurado
    await page.route('**/auth/v1/user*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-user-id-123',
          email: 'teste@seniorease.com',
          user_metadata: { name: 'Usuário de Teste' },
        }),
      });
    });

    await page.route('**/auth/v1/session*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'valid-mock-token',
          user: {
            id: 'mock-user-id-123',
            email: 'teste@seniorease.com',
          },
        }),
      });
    });

    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'mock-user-id-123',
            name: 'Usuário de Teste',
            email: 'teste@seniorease.com',
          },
        ]),
      });
    });

    await page.route('**/rest/v1/user_preferences*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            user_id: 'mock-user-id-123',
            font_size: 'grande',
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
  });

  test('should display tasks for the day and allow navigation to task details', async ({ page }) => {
    // Mock de login bem-sucedido
    await page.route('**/auth/v1/token*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'valid-mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'valid-mock-refresh',
          user: {
            id: 'mock-user-id-123',
            email: 'teste@seniorease.com',
            user_metadata: { name: 'Usuário de Teste' },
          },
        }),
      });
    });

    // Mock de tarefas retornadas pelo banco
    const now = new Date();
    const taskDueDate = now.toISOString(); // Data/hora atual

    await page.route('**/rest/v1/tasks*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'task-id-abc',
            user_id: 'mock-user-id-123',
            title: 'Tomar remédio de pressão',
            description: 'Tomar 1 comprimido de Enalapril',
            due_date: taskDueDate,
            is_completed: false,
            created_at: now.toISOString(),
            categories: {
              name: 'Saúde'
            }
          }
        ]),
      });
    });

    // Vai para a tela de login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'teste@seniorease.com');
    await page.fill('input[type="password"]', 'senhasegura123');
    await page.click('button:has-text("Entrar")');

    // Deve redirecionar diretamente para a home (dashboard)
    await page.waitForURL('**/');
    expect(page.url()).toBe('http://localhost:3000/');

    // Verifica se o título "Agenda do dia" está visível
    const heading = page.locator('h1:has-text("Agenda do dia")');
    await expect(heading).toBeVisible();

    // Verifica se a tarefa mockada é renderizada na lista
    const taskTitle = page.locator('h2:has-text("Tomar remédio de pressão")');
    await expect(taskTitle).toBeVisible();

    const taskDesc = page.locator('p:has-text("Tomar 1 comprimido de Enalapril")');
    await expect(taskDesc).toBeVisible();

    // Clica na tarefa para ir aos detalhes
    await taskTitle.click();

    // Deve navegar para a página de detalhes daquela tarefa
    await page.waitForURL('**/tarefas/task-id-abc');
    expect(page.url()).toContain('/tarefas/task-id-abc');
  });
});
