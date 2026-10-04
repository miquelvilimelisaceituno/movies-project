import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { AuthError } from '../../../core/auth/auth-error';
import { Session } from '../../../core/auth/session';
import { RegisterPage } from './register-page';

const VALID_DATA = {
  displayName: 'tonyina',
  email: 'tonyina@movies.dev',
  password: 'secret123',
  confirmPassword: 'secret123',
};

describe('RegisterPage', () => {
  let page: RegisterPage;
  let register: Mock;
  let navigateByUrl: Mock;

  beforeEach(() => {
    register = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([]), { provide: Session, useValue: { register } }],
    });

    navigateByUrl = vi.fn().mockResolvedValue(true);
    TestBed.inject(Router).navigateByUrl = navigateByUrl;

    page = TestBed.createComponent(RegisterPage).componentInstance;
  });

  function fillForm(data = VALID_DATA): void {
    page['form'].setValue(data);
  }

  it('should create', () => {
    expect(page).toBeTruthy();
  });

  it('does not call Firebase when the form is invalid', async () => {
    await page['submit']();

    expect(register).not.toHaveBeenCalled();
    expect(page['form'].touched).toBe(true);
  });

  it('registers with the form values and a trimmed name', async () => {
    fillForm({ ...VALID_DATA, displayName: '  tonyina  ' });

    await page['submit']();

    expect(register).toHaveBeenCalledWith('tonyina@movies.dev', 'secret123', 'tonyina');
  });

  it('goes to the home page after registering', async () => {
    fillForm();

    await page['submit']();

    expect(navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('is submitting only while waiting for Firebase', async () => {
    let finishRegister!: () => void;
    register.mockReturnValue(new Promise<void>((resolve) => (finishRegister = resolve)));
    fillForm();

    const submitting = page['submit']();
    expect(page['submitting']()).toBe(true);

    finishRegister();
    await submitting;
    expect(page['submitting']()).toBe(false);
  });

  it('shows the error key when registration fails', async () => {
    register.mockRejectedValue(new AuthError('auth.errors.emailInUse'));
    fillForm();

    await page['submit']();

    expect(page['errorKey']()).toBe('auth.errors.emailInUse');
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(page['submitting']()).toBe(false);
  });

  it('does not hide unexpected errors', async () => {
    register.mockRejectedValue(new Error('boom'));
    fillForm();

    await expect(page['submit']()).rejects.toThrow('boom');
  });
});
