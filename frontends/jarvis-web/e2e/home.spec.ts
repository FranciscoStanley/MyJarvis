import { test, expect } from '@playwright/test';

test.describe('MyJarvis E2E', () => {
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
    await expect(page.getByText(/JARVIS|Desculpe|senhor/i).first()).toBeVisible({ timeout: 15000 });
  });
});
