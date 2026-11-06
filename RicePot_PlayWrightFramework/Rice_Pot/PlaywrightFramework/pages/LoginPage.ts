import { expect, Locator, Page } from '@playwright/test';
import { loginLocators } from '../locators/login.js';

export class LoginPage {
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly submit: Locator;
  private readonly error: Locator;
  private readonly dashboard: Locator;

  constructor(private readonly page: Page) {
    this.email = page.locator(`xpath=${loginLocators.email}`);
    this.password = page.locator(`xpath=${loginLocators.password}`);
    this.submit = page.locator(`xpath=${loginLocators.submit}`);
    this.error = page.locator(`xpath=${loginLocators.error}`);
    this.dashboard = page.locator(`xpath=${loginLocators.dashboard}`);
  }

  async navigate(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(this.email).toBeVisible();
  }

  async enterEmail(email: string): Promise<void> {
    await this.email.fill(email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.password.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.submit.click();
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await this.enterEmail(email);
      await this.enterPassword(password);
      await this.clickLogin();
    } catch (error) {
      throw new Error(`Unable to submit VWO login form: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getErrorMessage(): Promise<string> {
    try {
      await expect(this.error.first()).toBeVisible();
      return (await this.error.first().textContent())?.trim() ?? '';
    } catch (error) {
      throw new Error(`VWO login error message was not visible: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async isDashboardVisible(): Promise<boolean> {
    return this.dashboard.first().isVisible().catch(() => false);
  }
}
