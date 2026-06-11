import { test, expect } from '@playwright/test';

test.describe('MyJarvis E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/auth/login/ldap')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              accessToken: 'e2e-token',
              user: {
                id: 'u1',
                email: 'user@ldap.local',
                name: 'E2E User',
                roles: ['user'],
                authSource: 'ldap',
              },
            },
          }),
        });
      }
      if (url.includes('/auth/login')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              accessToken: 'e2e-token',
              user: { id: 'u1', email: 'e2e@test.com', name: 'E2E', roles: ['user'] },
            },
          }),
        });
      }
      if (url.includes('/auth/profile')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: 'u1', email: 'e2e@test.com', name: 'E2E', roles: ['user'] },
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
          body: JSON.stringify({ success: true, data: { sessionId: 'e2e-session' } }),
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
            },
          }),
        });
      }
      return route.continue();
    });

    await page.addInitScript(() => {
      localStorage.setItem('jarvis_token', 'e2e-token');
    });
  });

  test('página inicial após autenticação', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'MyJarvis' })).toBeVisible();
    await expect(page.getByText(/Bem-vindo/i)).toBeVisible();
  });

  test('orb JARVIS visível', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('J', { exact: true })).toBeVisible();
  });

  test('enviar mensagem no chat', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder(/Fale ou digite/i);
    await input.fill('Olá JARVIS');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByText(/senhor/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
