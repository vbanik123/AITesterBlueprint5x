export const loginLocators = {
  email: "//input[@type='email' or @autocomplete='email']",
  password: "//input[@type='password' or @autocomplete='current-password']",
  submit: "//button[@type='submit'] | //input[@type='submit']",
  error: "//*[@role='alert' or @aria-live='assertive']",
  dashboard: "//*[self::main or self::nav][not(contains(@class,'login'))]"
} as const;
