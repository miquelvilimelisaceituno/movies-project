import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TEXTS } from './core/config/texts';
import { Navigation } from './layout/navigation/navigation';

@Component({
  imports: [Navigation, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('project-movies');
  protected readonly texts = TEXTS.navigation;
}
