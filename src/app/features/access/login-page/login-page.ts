import { afterNextRender, Component, ElementRef, inject, Injector, signal, input } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PATHS } from '../../../core/config/paths';
import { TEXTS } from '../../../core/config/texts';
import { AuthErrorKey } from '../../../core/auth/auth-error-key';
import { GoogleSignIn } from '../google-sign-in/google-sign-in';
import { AuthError } from '../../../core/auth/auth-error';
import { Session } from '../../../core/auth/session';
import { safeReturnUrl } from '../../../core/auth/safe-return-url';

@Component({
  imports: [ReactiveFormsModule, RouterLink, GoogleSignIn],
  selector: 'app-login-page',
  styleUrl: './login-page.css',
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly paths = PATHS;
  protected readonly texts = TEXTS.auth;
  /** Filled from ?returnUrl= by the router (withComponentInputBinding). */
  readonly returnUrl = input<string>();

  protected readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    // Only "filled in": Firebase decides whether the password is right.
    password: ['', Validators.required],
  });

  /** True while waiting for Firebase, to avoid double submits. */
  protected readonly submitting = signal(false);

  /** i18n key of the error to show, or null when there is none. */
  protected readonly errorKey = signal<AuthErrorKey | null>(null);

  protected showError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.errorKey.set(null);

    try {
      await this.session.login(email, password);
      await this.goToReturnUrl();
    } catch (error) {
      if (!(error instanceof AuthError)) {
        throw error;
      }
      this.errorKey.set(error.key);
    } finally {
      this.submitting.set(false);
    }
  }

  protected goToReturnUrl(): Promise<boolean> {
    return this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
  }

  private focusFirstInvalidField(): void {
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      { injector: this.injector },
    );
  }
}