import { describe, expect, it } from 'vitest';
import { TEXTS } from '../config/texts';

import { authErrorKey, UNKNOWN_AUTH_ERROR_KEY } from './auth-error-key';

describe('authErrorKey', () => {
  it.each([
    ['auth/email-already-in-use', 'emailInUse'],
    ['auth/invalid-email', 'invalidEmail'],
    ['auth/weak-password', 'weakPassword'],
    ['auth/invalid-credential', 'invalidCredentials'],
    ['auth/too-many-requests', 'tooManyRequests'],
    ['auth/network-request-failed', 'network'],
    ['auth/popup-blocked', 'popupBlocked'],
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

  it('only returns keys that have a text in es.json', () => {
    expect(TEXTS.auth.errors[UNKNOWN_AUTH_ERROR_KEY]).toBeTruthy();
  });
});
