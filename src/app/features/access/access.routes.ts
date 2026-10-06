import { Routes } from '@angular/router';
import { PATHS } from '../../core/config/paths';
import { TEXTS } from '../../core/config/texts';

/** Routes of the access feature: register and, later, login. */
export const ACCESS_ROUTES: Routes = [
   {
    path: PATHS.login,
    loadComponent: () => import('./login-page/login-page').then((m) => m.LoginPage),
    title: TEXTS.auth.login.pageTitle,
  },
  {
    path: PATHS.register,
    loadComponent: () => import('./register-page/register-page').then((m) => m.RegisterPage),
    title: TEXTS.auth.register.pageTitle,
  },
];