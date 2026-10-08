import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import type { Mock } from 'vitest';

import { authGuard } from './auth-guard';
import { Session } from './session';

describe('authGuard', () => {
  let isLoggedIn: ReturnType<typeof signal<boolean>>;
  let ready: Mock;

  beforeEach(() => {
    isLoggedIn = signal(false);
    ready = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Session, useValue: { isLoggedIn, ready } }],
    });
  });

  function runGuard(url: string) {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => authGuard(route, state));
  }

  it('lets a signed-in user through', async () => {
    isLoggedIn.set(true);

    expect(await runGuard('/perfil')).toBe(true);
  });

  it('sends a visitor to login, remembering where they wanted to go', async () => {
    const result = await runGuard('/perfil');

    expect(result).toBeInstanceOf(UrlTree);
    const tree = result as UrlTree;
    expect(tree.root.children['primary'].segments.map((s) => s.path)).toEqual(['iniciar-sesion']);
    expect(tree.queryParams).toEqual({ returnUrl: '/perfil' });
  });

  it('waits for Firebase to restore the session before deciding', async () => {
    let finishRestoring!: () => void;
    ready.mockReturnValue(new Promise<void>((resolve) => (finishRestoring = resolve)));

    const result = runGuard('/perfil');
    isLoggedIn.set(true); // Firebase finds the previous session meanwhile
    finishRestoring();

    expect(await result).toBe(true);
  });
});