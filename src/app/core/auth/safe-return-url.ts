const HOME = '/';

/**
 * Returns the URL only if it stays inside the app, otherwise home.
 * Prevents open redirects through ?returnUrl= after login.
 */

export function safeReturnUrl(url: string | null | undefined): string {
  const isInternal = !!url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
  return isInternal ? url : HOME;
}