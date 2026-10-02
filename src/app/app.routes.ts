import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'explorar' },
  { path: 'explorar', loadChildren: () => import('./features/explore/explore.routes') },
];
