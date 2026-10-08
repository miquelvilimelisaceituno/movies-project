import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import { AuthError } from '../../../core/auth/auth-error';
import { Session } from '../../../core/auth/session';
import { GoogleSignIn } from './google-sign-in';

describe('GoogleSignIn', () => {
  let button: GoogleSignIn;
  let loginWithGoogle: Mock;
  let signedIn: Mock;

  beforeEach(() => {
    loginWithGoogle = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [GoogleSignIn],
      providers: [{ provide: Session, useValue: { loginWithGoogle } }],
    });

    button = TestBed.createComponent(GoogleSignIn).componentInstance;

    signedIn = vi.fn();
    button.signedIn.subscribe(signedIn);
  });

  it('should create', () => {
    expect(button).toBeTruthy();
  });

  it('signs in with Google and goes home', async () => {
    await button['signIn']();

    expect(loginWithGoogle).toHaveBeenCalled();
    expect(signedIn).toHaveBeenCalled();
  });

  it('shows nothing when the user closes the popup', async () => {
    loginWithGoogle.mockRejectedValue(new AuthError(null));

    await button['signIn']();

    expect(button['errorKey']()).toBeNull();
    expect(signedIn).not.toHaveBeenCalled();
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