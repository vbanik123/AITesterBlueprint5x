import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string {
  return process.env[name]?.trim() ?? '';
}

export const environment = {
  baseUrl: required('BASE_URL'),
  validUsername: optional('VALID_USERNAME'),
  validPassword: optional('VALID_PASSWORD'),
  invalidUsername: required('INVALID_USERNAME'),
  invalidPassword: required('INVALID_PASSWORD')
} as const;

export const hasValidCredentials = Boolean(environment.validUsername && environment.validPassword);
