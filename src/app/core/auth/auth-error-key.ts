import { TEXTS } from "../config/texts";

/** Key of a message inside TEXTS.auth.errors (checked at compile time). */
export type AuthErrorKey = keyof typeof TEXTS.auth.errors;

/** i18n key shown when the error is not mapped. */
export const UNKNOWN_AUTH_ERROR_KEY: AuthErrorKey = 'unknown';

/** Firebase error codes mapped to i18n keys. */
const AUTH_ERROR_KEYS: Readonly<Record<string, AuthErrorKey>> = {
  //To support a new Firebase error, add one line here.
  'auth/email-already-in-use': 'emailInUse',
  'auth/invalid-email': 'invalidEmail',
  'auth/weak-password': 'weakPassword',
  'auth/invalid-credential': 'invalidCredentials',
  'auth/too-many-requests': 'tooManyRequests',
  'auth/network-request-failed': 'network',
  'auth/popup-blocked': 'popupBlocked',
};

/** Codes caused by the user's own action: nothing to show. */
const SILENT_ERROR_CODES: ReadonlySet<string> = new Set([
  //The user closed or replaced the popup on purpose: not a failure.
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
]);

/**
 * Translates an error thrown by Firebase Auth into an i18n key.
 * Returns null when no message should be shown to the user.
 */
export function authErrorKey(error: unknown): AuthErrorKey | null {
  const code = getErrorCode(error);

  if (code === null) {
    return UNKNOWN_AUTH_ERROR_KEY;
  }
  if (SILENT_ERROR_CODES.has(code)) {
    return null;
  }
  return AUTH_ERROR_KEYS[code] ?? UNKNOWN_AUTH_ERROR_KEY;
}

function getErrorCode(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }
  return null;
}
