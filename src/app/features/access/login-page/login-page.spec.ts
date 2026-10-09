import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Mock } from 'vitest';

import { AuthError } from '../../../core/auth/auth-error';
import { Session } from '../../../core/auth/session';
import { LoginPage } from './login-page';

const VALID_DATA = { email: 'ana@movies.dev', password: 'secret123' };

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let page: LoginPage;
  let login: Mock;
  let navigateByUrl: Mock;

  beforeEach(() => {
    login = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: Session, useValue: { login } }],
    });

    navigateByUrl = vi.fn().mockResolvedValue(true);
    TestBed.inject(Router).navigateByUrl = navigateByUrl;

    fixture = TestBed.createComponent(LoginPage);
    page = fixture.componentInstance;
  });

  function fillForm(data = VALID_DATA): void {
    page['form'].setValue(data);
  }

  it('should create', () => {
    expect(page).toBeTruthy();
  });

  it('does not call Firebase when the form is invalid', async () => {
    await page['submit']();

    expect(login).not.toHaveBeenCalled();
    expect(page['form'].touched).toBe(true);
  });

  it('accepts any non-empty password (no length rule on login)', () => {
    fillForm({ ...VALID_DATA, password: '1' });

    expect(page['form'].valid).toBe(true);
  });

  it('logs in with the form values and goes home', async () => {
    fillForm();

    await page['submit']();

    expect(login).toHaveBeenCalledWith('ana@movies.dev', 'secret123');
    expect(navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows the error key when the credentials are wrong', async () => {
    login.mockRejectedValue(new AuthError('invalidCredentials'));
    fillForm();

    await page['submit']();

    expect(page['errorKey']()).toBe('invalidCredentials');
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(page['submitting']()).toBe(false);
  });

  it('does not hide unexpected errors', async () => {
    login.mockRejectedValue(new Error('boom'));
    fillForm();

    await expect(page['submit']()).rejects.toThrow('boom');
  });

  it('returns to the page the guard sent the user from', async () => {
    fixture.componentRef.setInput('returnUrl', '/perfil');
    fillForm();

    await page['submit']();

    expect(navigateByUrl).toHaveBeenCalledWith('/perfil');
  });

  it('ignores unsafe return URLs', async () => {
    fixture.componentRef.setInput('returnUrl', 'https://evil.com');
    fillForm();

    await page['submit']();

    expect(navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows the login text on the submit button', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(button.textContent).toContain('Entrar');
  });

  it('shows the loading text on the submit button while submitting', () => {
    page['submitting'].set(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(button.textContent).toContain('Entrando…');
  });
});