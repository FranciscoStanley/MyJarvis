import { test, expect } from '@playwright/test';

test.describe('Usability — Jarvis Web', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/auth/profile')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'ux-user',
              email: 'ux@test.com',
              name: 'UX User',
              roles: ['user'],
              hasAcceptedTerms: true,
            },
          }),
        });
      }
      return route.continue();
    });

    await page.route('**/api/chat/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/chat/session')) {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { sessionId: 'ux-session' } }),
        });
      }
      if (url.includes('/chat/message')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              sessionId: 'ux-session',
              reply: 'À sua disposição, senhor. Resposta recebida.',
            },
          }),
        });
      }
      return route.continue();
    });

    await page.addInitScript(() => {
      localStorage.setItem('jarvis_token', 'ux-token');
    });
  });

  test('elementos principais têm acessibilidade básica e envio por teclado', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'MyJarvis' })).toBeVisible({
      timeout: 15_000,
    });

    const input = page.getByRole('textbox', { name: 'Mensagem para o JARVIS' });
    await expect(input).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Falar' })).toBeVisible();
    await expect(page.getByRole('img', { name: /JARVIS/i })).toBeVisible();

    await input.fill('Olá JARVIS');
    await input.press('Enter');
    await expect(page.getByText('Resposta recebida.')).toBeVisible({ timeout: 15_000 });
  });
});
