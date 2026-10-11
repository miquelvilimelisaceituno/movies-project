import { Routes } from '@angular/router';
import { TEXTS } from '../../core/config/texts';
import { FavoritesPage } from './favorites-page/favorites-page';

export default [
  { path: '', component: FavoritesPage, title: TEXTS.favorites.pageTitle },
] satisfies Routes;
