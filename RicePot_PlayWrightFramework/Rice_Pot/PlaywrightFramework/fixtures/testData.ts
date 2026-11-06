import { environment } from '../utils/env.js';

export const testData = {
  validUser: {
    username: environment.validUsername,
    password: environment.validPassword
  },
  invalidUser: {
    username: environment.invalidUsername,
    password: environment.invalidPassword
  }
} as const;
