import { test, expect, type Page } from '@playwright/test';

async function setupTermsRoutes(page: Page) {
  let hasAcceptedTerms = false;

  await page.route('**/api/auth/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/profile')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'uat-user',
            email: 'uat@test.com',
            name: 'UAT User',
            roles: ['user'],
            hasAcceptedTerms,
          },
        }),
      });
    }

    if (url.includes('/auth/accept-terms')) {
      hasAcceptedTerms = true;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'uat-user',
            email: 'uat@test.com',
            name: 'UAT User',
            roles: ['user'],
            hasAcceptedTerms: true,
            termsVersion: '2026-06-01',
            termsAcceptedAt: new Date().toISOString(),
          },
        }),
      });
    }

    return route.continue();
  });

  await page.route('**/api/chat/session', async (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { sessionId: 'uat-session' } }),
    }));
}

test.describe('UAT — Aceite de termos', () => {
  test.beforeEach(async ({ page }) => {
    await setupTermsRoutes(page);
    await page.addInitScript(() => {
      localStorage.setItem('jarvis_token', 'uat-token');
    });
  });

  test('usuário precisa aceitar termos para entrar na interface principal', async ({ page }) => {
    await page.goto('/');

    const submit = page.getByRole('button', { name: 'Aceitar e continuar' });
    await expect(submit).toBeVisible();
    await expect(submit).toBeDisabled();

    await page.getByRole('checkbox').check();
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByRole('heading', { level: 1, name: 'MyJarvis' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Aceitar e continuar' })).toHaveCount(0);
  });
});
