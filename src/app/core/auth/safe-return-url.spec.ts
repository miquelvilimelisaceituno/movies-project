import { safeReturnUrl } from './safe-return-url';

describe('safeReturnUrl', () => {
  it('goes home when there is no return URL', () => {
    expect(safeReturnUrl(undefined)).toBe('/');
    expect(safeReturnUrl(null)).toBe('/');
    expect(safeReturnUrl('')).toBe('/');
  });

  it('keeps internal URLs with their query string', () => {
    expect(safeReturnUrl('/perfil')).toBe('/perfil');
    expect(safeReturnUrl('/explorar?page=2')).toBe('/explorar?page=2');
  });

  it.each(['https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)', 'perfil'])(
    'goes home for the unsafe URL %s',
    (url) => {
      expect(safeReturnUrl(url)).toBe('/');
    },
  );
});