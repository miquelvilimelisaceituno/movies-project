import { describe, expect, it } from 'vitest';

import { authErrorKey, UNKNOWN_AUTH_ERROR_KEY } from './auth-error-key';

describe('authErrorKey', () => {
  it.each([
    ['auth/email-already-in-use', 'auth.errors.emailInUse'],
    ['auth/invalid-email', 'auth.errors.invalidEmail'],
    ['auth/weak-password', 'auth.errors.weakPassword'],
    ['auth/invalid-credential', 'auth.errors.invalidCredentials'],
    ['auth/too-many-requests', 'auth.errors.tooManyRequests'],
    ['auth/network-request-failed', 'auth.errors.network'],
    ['auth/popup-blocked', 'auth.errors.popupBlocked'],
  ])('maps %s to %s', (code, expectedKey) => {
    expect(authErrorKey({ code })).toBe(expectedKey);
  });

  it.each(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])(
    'returns null when the user cancels the popup (%s)',
    (code) => {
      expect(authErrorKey({ code })).toBeNull();
    },
  );

  it('returns the unknown key for an unexpected Firebase code', () => {
    expect(authErrorKey({ code: 'auth/something-new' })).toBe(UNKNOWN_AUTH_ERROR_KEY);
  });

  it('returns the unknown key for errors without a code', () => {
    expect(authErrorKey(new Error('boom'))).toBe(UNKNOWN_AUTH_ERROR_KEY);
    expect(authErrorKey(undefined)).toBe(UNKNOWN_AUTH_ERROR_KEY);
  });
});
