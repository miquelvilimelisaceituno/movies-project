/** i18n key shown when the error is not mapped. */
export const UNKNOWN_AUTH_ERROR_KEY = 'auth.errors.unknown';

/** Firebase error codes mapped to i18n keys. */
const AUTH_ERROR_KEYS: Readonly<Record<string, string>> = {
  //To support a new Firebase error, add one line here.
  'auth/email-already-in-use': 'auth.errors.emailInUse',
  'auth/invalid-email': 'auth.errors.invalidEmail',
  'auth/weak-password': 'auth.errors.weakPassword',
  'auth/invalid-credential': 'auth.errors.invalidCredentials',
  'auth/too-many-requests': 'auth.errors.tooManyRequests',
  'auth/network-request-failed': 'auth.errors.network',
  'auth/popup-blocked': 'auth.errors.popupBlocked',
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
export function authErrorKey(error: unknown): string | null {
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
