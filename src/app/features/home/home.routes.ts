import { Routes } from '@angular/router';
import { TEXTS } from '../../core/config/texts';
import { HomePage } from './home-page/home-page';

export default [{ path: '', component: HomePage, title: TEXTS.home.pageTitle }] satisfies Routes;
