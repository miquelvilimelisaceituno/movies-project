import { Routes } from '@angular/router';
import { TEXTS } from '../../core/config/texts';
import { MoviePage } from './movie-page/movie-page';

export default [
  { path: ':id', component: MoviePage, title: TEXTS.movie.pageTitle },
] satisfies Routes;
