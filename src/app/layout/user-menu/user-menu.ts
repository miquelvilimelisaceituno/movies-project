import { Component, inject, signal } from '@angular/core';
import {Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthError } from '../../core/auth/auth-error';
import type { AuthErrorKey } from '../../core/auth/auth-error-key';
import { Session } from '../../core/auth/session';
import { PATHS } from '../../core/config/paths';
import { TEXTS } from '../../core/config/texts';


/** Login/register links or the current user with a logout button. */
@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-user-menu',
  styleUrl: './user-menu.css',
  templateUrl: './user-menu.html',
})
export class UserMenu {
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  protected readonly paths = PATHS;
  protected readonly texts = TEXTS.auth;
  protected readonly user = this.session.user;

  /** True while signing out, to avoid double clicks. */
  protected readonly submitting = signal(false);

  /** i18n key of the error to show, or null when there is none. */
  protected readonly errorKey = signal<AuthErrorKey | null>(null);

  protected async logout(): Promise<void> {
    this.submitting.set(true);
    this.errorKey.set(null);

    try {
      await this.session.logout();
      // Guards don't re-run on their own: leave any private page.
      await this.router.navigateByUrl('/');
    } catch (error) {
      if (!(error instanceof AuthError)) {
        throw error;
      }
      this.errorKey.set(error.key);
    } finally {
      this.submitting.set(false);
    }
  }
}
