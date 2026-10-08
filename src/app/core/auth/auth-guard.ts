import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PATHS } from '../config/paths';
import { Session } from './session';

/** Lets signed-in users in; sends visitors to login, remembering where they were going. */
export const authGuard: CanActivateFn = async (_route, state) => {
  // inject() only works before the first await.
  const session = inject(Session);
  const router = inject(Router);

  await session.ready();

  if (session.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/', PATHS.login], { queryParams: { returnUrl: state.url } });
};