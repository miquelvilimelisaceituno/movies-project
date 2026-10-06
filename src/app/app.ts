import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { UserMenu } from './layout/user-menu/user-menu';

@Component({
  imports: [RouterOutlet, UserMenu],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('project-movies');
}
