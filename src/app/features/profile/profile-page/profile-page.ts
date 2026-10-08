import { Component, inject } from '@angular/core';

import { Session } from '../../../core/auth/session';
import { TEXTS } from '../../../core/config/texts';

/** Private page with the signed-in user's account data. */
@Component({
  selector: 'app-profile-page',
  styleUrl: './profile-page.css',
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  protected readonly texts = TEXTS.profile;
  protected readonly user = inject(Session).user;
}