import { Component, inject, signal, output } from '@angular/core';

import { AuthError } from '../../../core/auth/auth-error';
import type { AuthErrorKey } from '../../../core/auth/auth-error-key';
import { Session } from '../../../core/auth/session';
import { TEXTS } from '../../../core/config/texts';

/** "Continue with Google" button, shared by the login and register pages. */
@Component({
  selector: 'app-google-sign-in',
  styleUrl: './google-sign-in.css',
  templateUrl: './google-sign-in.html',
})
export class GoogleSignIn {
  private readonly session = inject(Session);

  protected readonly texts = TEXTS.auth;

  /** Emits once the user has signed in, so the page decides where to go. */
  readonly signedIn = output<void>();

  /** True while the Google popup is open. */
  protected readonly submitting = signal(false);

  /** i18n key of the error to show, or null when there is none. */
  protected readonly errorKey = signal<AuthErrorKey | null>(null);

  protected async signIn(): Promise<void> {
    this.submitting.set(true);
    this.errorKey.set(null);

    try {
      await this.session.loginWithGoogle();
      this.signedIn.emit();
    } catch (error) {
      if (!(error instanceof AuthError)) {
        throw error;
      }
      // key is null when the user closed the popup: nothing to show.
      this.errorKey.set(error.key);
    } finally {
      this.submitting.set(false);
    }
  }
}