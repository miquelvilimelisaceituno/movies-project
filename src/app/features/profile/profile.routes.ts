import { Routes } from '@angular/router';

import { TEXTS } from '../../core/config/texts';

export default [
  {
    path: '',
    loadComponent: () => import('./profile-page/profile-page').then((m) => m.ProfilePage),
    title: TEXTS.profile.pageTitle,
  },
] satisfies Routes;