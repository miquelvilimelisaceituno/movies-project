import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TEXTS } from '../../core/config/texts';
import { UserMenu } from '../user-menu/user-menu';

@Component({
  imports: [RouterLink, RouterLinkActive, UserMenu],
  selector: 'app-navigation',
  styleUrl: './navigation.css',
  templateUrl: './navigation.html',
})
export class Navigation {
  protected readonly texts = TEXTS.navigation;
}
