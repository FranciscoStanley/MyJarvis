import { test, expect } from '@playwright/test';

test.describe('MyJarvis E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/chat/session')) {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { sessionId: 'e2e-session' },
            timestamp: new Date().toISOString(),
          }),
        });
      }
      if (url.includes('/chat/message')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              reply: 'Bom dia, senhor. Sistemas operacionais.',
              sessionId: 'e2e-session',
              searchResults: [],
            },
            timestamp: new Date().toISOString(),
          }),
        });
      }
      return route.continue();
    });
  });

  test('página inicial carrega com título MyJarvis', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'MyJarvis' })).toBeVisible();
  });

  test('orb JARVIS visível', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('J', { exact: true })).toBeVisible();
  });

  test('continuar como convidado e enviar mensagem', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Continuar como convidado/i }).click();
    const input = page.getByPlaceholder(/Fale ou digite/i);
    await input.fill('Olá JARVIS');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByText(/senhor/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
