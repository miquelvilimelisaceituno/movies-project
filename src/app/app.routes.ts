import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: '',
    loadChildren: () => import('./features/access/access.routes').then((m) => m.ACCESS_ROUTES),
  },
];
