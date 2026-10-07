import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Mock } from 'vitest';

import type { AppUser } from '../../core/auth/app-user';
import { AuthError } from '../../core/auth/auth-error';
import { Session } from '../../core/auth/session';
import { UserMenu } from './user-menu';

const TONYINA: AppUser = { uid: '1', email: 'tonyina@test.com', displayName: 'Tonyina', photoUrl: null };

describe('UserMenu', () => {
  let user: ReturnType<typeof signal<AppUser | null | undefined>>;
  let fixture: ComponentFixture<UserMenu>;
  let logout: Mock;
  let navigateByUrl: Mock;


  beforeEach(() => {
    user = signal<AppUser | null | undefined>(undefined);
    logout = vi.fn().mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      imports: [UserMenu],
      providers: [provideRouter([]), { provide: Session, useValue: { user, logout } }],
    });

    navigateByUrl = vi.fn().mockResolvedValue(true);
    TestBed.inject(Router).navigateByUrl = navigateByUrl;

    fixture = TestBed.createComponent(UserMenu);
  });

  function render(): HTMLElement {
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows nothing while the session is being restored', () => {
    const element = render();

    expect(element.querySelector('a')).toBeNull();
    expect(element.querySelector('button')).toBeNull();
  });

  it('shows login and register links without a session', () => {
    user.set(null);
    const element = render();

    expect(element.querySelector('a[href="/iniciar-sesion"]')).not.toBeNull();
    expect(element.querySelector('a[href="/registro"]')).not.toBeNull();
  });

  it('shows the user name and a logout button with a session', () => {
    user.set(TONYINA);
    const element = render();

    expect(element.textContent).toContain('Tonyina');
    expect(element.querySelector('button')).not.toBeNull();
  });

  it('falls back to the email when there is no display name', () => {
    user.set({ ...TONYINA, displayName: null });

    expect(render().textContent).toContain('tonyina@test.com');
  });

  it('logs out and goes home', async () => {
    await fixture.componentInstance['logout']();

    expect(logout).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows the error key when logout fails', async () => {
    logout.mockRejectedValue(new AuthError('network'));

    await fixture.componentInstance['logout']();

    expect(fixture.componentInstance['errorKey']()).toBe('network');
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('does not hide unexpected errors', async () => {
    logout.mockRejectedValue(new Error('boom'));

    await expect(fixture.componentInstance['logout']()).rejects.toThrow('boom');
  });


});
