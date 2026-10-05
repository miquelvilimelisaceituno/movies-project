import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { AuthError } from '../../../core/auth/auth-error';
import { Session } from '../../../core/auth/session';
import { GoogleSignIn } from './google-sign-in';

describe('GoogleSignIn', () => {
  let button: GoogleSignIn;
  let loginWithGoogle: Mock;
  let navigateByUrl: Mock;

  beforeEach(() => {
    loginWithGoogle = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [GoogleSignIn],
      providers: [provideRouter([]), { provide: Session, useValue: { loginWithGoogle } }],
    });

    navigateByUrl = vi.fn().mockResolvedValue(true);
    TestBed.inject(Router).navigateByUrl = navigateByUrl;

    button = TestBed.createComponent(GoogleSignIn).componentInstance;
  });

  it('should create', () => {
    expect(button).toBeTruthy();
  });

  it('signs in with Google and goes home', async () => {
    await button['signIn']();

    expect(loginWithGoogle).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows nothing when the user closes the popup', async () => {
    loginWithGoogle.mockRejectedValue(new AuthError(null));

    await button['signIn']();

    expect(button['errorKey']()).toBeNull();
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(button['submitting']()).toBe(false);
  });

  it('shows the error key when the popup is blocked', async () => {
    loginWithGoogle.mockRejectedValue(new AuthError('popupBlocked'));

    await button['signIn']();

    expect(button['errorKey']()).toBe('popupBlocked');
  });

  it('does not hide unexpected errors', async () => {
    loginWithGoogle.mockRejectedValue(new Error('boom'));

    await expect(button['signIn']()).rejects.toThrow('boom');
  });
});