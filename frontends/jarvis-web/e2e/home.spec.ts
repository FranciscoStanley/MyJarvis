import { test, expect, type Page } from '@playwright/test';

const e2eUser = {
  id: 'u1',
  email: 'e2e@test.com',
  name: 'E2E',
  roles: ['user'],
  hasAcceptedTerms: true,
};

const e2eSessionId = 'e2e-session';

function chatRouteHandler(
  route: Parameters<Parameters<Page['route']>[1]>[0],
  messageBody?: Record<string, unknown>,
) {
  const url = route.request().url();
  const method = route.request().method();

  if (url.includes('/chat/sessions') && method === 'GET') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [{
          id: e2eSessionId,
          userId: e2eUser.id,
          title: 'Nova conversa',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
        }],
      }),
    });
  }

  if (url.match(/\/chat\/session\/[^/]+$/) && method === 'GET') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { sessionId: e2eSessionId, messages: [] },
      }),
    });
  }

  if (url.endsWith('/chat/session') && method === 'POST') {
    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { sessionId: e2eSessionId } }),
    });
  }

  if (url.includes('/chat/message') && method === 'POST') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: messageBody ?? {
          reply: 'Bom dia, senhor. Sistemas operacionais.',
          sessionId: e2eSessionId,
        },
      }),
    });
  }

  return route.continue();
}

async function gotoAuthenticatedHome(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'MyJarvis' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByPlaceholder(/Fale ou digite/i)).toBeVisible({ timeout: 15_000 });
}

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
                hasAcceptedTerms: true,
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
              user: e2eUser,
            },
          }),
        });
      }
      if (url.includes('/auth/profile') || url.includes('/auth/accept-terms')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: e2eUser,
          }),
        });
      }
      return route.continue();
    });

    await page.route('**/api/chat/**', (route) => chatRouteHandler(route));

    await page.addInitScript(() => {
      localStorage.setItem('jarvis_token', 'e2e-token');
    });
  });

  test('página inicial após autenticação', async ({ page }) => {
    await gotoAuthenticatedHome(page);
    await expect(page.getByText(/Bem-vindo/i)).toBeVisible();
  });

  test('orb JARVIS visível', async ({ page }) => {
    await gotoAuthenticatedHome(page);
    await expect(page.getByRole('img', { name: /JARVIS/i })).toBeVisible();
  });

  test('enviar mensagem no chat', async ({ page }) => {
    await gotoAuthenticatedHome(page);
    const input = page.getByPlaceholder(/Fale ou digite/i);
    await input.fill('Olá JARVIS');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByText(/senhor/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('auto-execução de ação YouTube sem botão de confirmação', async ({ page }) => {
    await page.route('**/api/chat/**', (route) =>
      chatRouteHandler(route, {
        reply: 'À sua disposição, senhor. Abrindo YouTube.',
        sessionId: e2eSessionId,
        clientActions: [{
          id: 'e2e-yt',
          type: 'open_app',
          label: 'Abrir YouTube',
          description: 'Abrir YouTube',
          url: 'https://www.youtube.com',
          app: 'youtube',
          requiresConfirmation: false,
        }],
      }),
    );

    await gotoAuthenticatedHome(page);
    await page.getByPlaceholder(/Fale ou digite/i).fill('Abra o YouTube');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByText(/Abrindo YouTube/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Abrir YouTube/i })).toHaveCount(0);
  });
});
