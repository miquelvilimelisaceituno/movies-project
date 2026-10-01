/**
 * Error thrown by Session when an auth action fails.
 * `key` is the i18n key to show, or null when nothing should be shown.
 */
export class AuthError extends Error {
  constructor(readonly key: string | null) {
    super(key ?? 'auth.cancelled');
    this.name = 'AuthError';
  }
}