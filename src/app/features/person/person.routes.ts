import { Routes } from '@angular/router';
import { TEXTS } from '../../core/config/texts';
import { PersonPage } from './person-page/person-page';

export default [
  { path: ':id', component: PersonPage, title: TEXTS.person.pageTitle },
] satisfies Routes;
