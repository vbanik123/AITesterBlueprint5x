import { expect, test } from '@playwright/test';
import { testData } from '../fixtures/testData.js';
import { LoginPage } from '../pages/LoginPage.js';
import { environment, hasValidCredentials } from '../utils/env.js';

test.describe('VWO valid login', () => {
  test.skip(!hasValidCredentials, 'VALID_USERNAME and VALID_PASSWORD are required for the positive login test.');
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('logs in with valid credentials', async ({ page }) => {
    try {
      await loginPage.login(testData.validUser.username, testData.validUser.password);
      await expect(page).not.toHaveURL(environment.baseUrl);
      await expect.poll(() => loginPage.isDashboardVisible()).toBe(true);
    } catch (error) {
      throw new Error(`Valid VWO login failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
});

test.describe('VWO invalid login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('rejects invalid credentials', async () => {
    try {
      await loginPage.login(testData.invalidUser.username, testData.invalidUser.password);
      await expect(await loginPage.getErrorMessage()).not.toBe('');
    } catch (error) {
      throw new Error(`Invalid VWO login validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
});
