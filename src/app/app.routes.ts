import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { PATHS } from './core/config/paths';

export const routes: Routes = [
 

  { path: '', pathMatch: 'full', loadChildren: () => import('./features/home/home.routes') },
  { path: 'explorar', loadChildren: () => import('./features/explore/explore.routes') },
  { path: 'peliculas', loadChildren: () => import('./features/movie-detail/movie-detail.routes') },
  { path: 'personas', loadChildren: () => import('./features/person/person.routes') },
  { path: PATHS.profile, canActivate: [authGuard], loadChildren: () => import('./features/profile/profile.routes'),},
  { path: '', loadChildren: () => import('./features/access/access.routes').then((m) => m.ACCESS_ROUTES),}
];
