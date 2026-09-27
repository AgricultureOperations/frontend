import { expect, test } from '@playwright/test';

// Visual regression for /login in light and dark mode.
// Baselines live in tests/__screenshots__/. See tests/README.md to run and update them.

const viewports = [
  { name: 'desktop', size: { width: 1440, height: 900 } },
  { name: 'mobile', size: { width: 375, height: 812 } },
];

for (const { name, size } of viewports) {
  test.describe(`login page (${name} ${size.width}x${size.height})`, () => {
    test.use({ viewport: size });

    test('matches the light baseline, then the dark baseline after the theme toggle', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      // Light mode is the default.
      await expect(page.locator('[data-theme="light"]')).toBeVisible();
      await expect(page).toHaveScreenshot(`login-light-${name}.png`);

      // Toggle to dark mode.
      await page.getByRole('button', { name: 'Switch to dark mode' }).click();
      await expect(page.locator('[data-theme="dark"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
      // Park the pointer so the toggle's :hover style is not part of the snapshot.
      await page.mouse.move(0, 0);
      await expect(page).toHaveScreenshot(`login-dark-${name}.png`);
    });
  });
}
