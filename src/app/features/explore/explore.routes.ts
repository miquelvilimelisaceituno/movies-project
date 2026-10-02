import { Routes } from '@angular/router';
import { TEXTS } from '../../core/config/texts';
import { ExplorePage } from './explore-page/explore-page';

export default [
  { path: '', component: ExplorePage, title: TEXTS.explore.pageTitle },
] satisfies Routes;
