import { Component, inject, signal, afterNextRender, ElementRef, Injector } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PATHS } from '../../../core/config/paths';
import { TEXTS } from '../../../core/config/texts';

import { Session } from '../../../core/auth/session';
import { passwordsMatch, PASSWORDS_MISMATCH } from '../passwords-match';
import { AuthError } from '../../../core/auth/auth-error';
import { AuthErrorKey } from '../../../core/auth/auth-error-key';



/** Firebase rejects passwords shorter than 6 characters. */
const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register-page',
  styleUrl: './register-page.css',
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly paths = PATHS;
  protected readonly texts = TEXTS.auth;

  protected readonly form = this.formBuilder.group(
    {
      displayName: ['', [Validators.required, Validators.minLength(MIN_NAME_LENGTH)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch('password', 'confirmPassword') },
  );

  /** True while waiting for Firebase, to avoid double submits. */
  protected readonly submitting = signal(false);

  /** i18n key of the error to show, or null when there is none. */
  protected readonly errorKey = signal<AuthErrorKey | null>(null);

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    const { displayName, email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.errorKey.set(null);

    try {
      await this.session.register(email, password, displayName.trim());
      await this.router.navigateByUrl('/');
    } catch (error) {
      if (!(error instanceof AuthError)) {
        throw error;
      }
      this.errorKey.set(error.key);
    } finally {
      this.submitting.set(false);
    }
  };

  /** A field shows its error only after the user has left it (or tried to submit). */
  protected showError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  /** The mismatch is a group error, but it is shown under the confirmation field. */
  protected showPasswordsMismatch(): boolean {
    return this.form.hasError(PASSWORDS_MISMATCH) && this.form.controls.confirmPassword.touched;
  }

  /** Moves focus to the first field with an error, once the errors are rendered. */
  private focusFirstInvalidField(): void {
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      { injector: this.injector },
    );
  }
}