import { Component, input, output } from '@angular/core';
import { TEXTS } from '../../../core/config/texts';

@Component({
  selector: 'app-favorite-button',
  styleUrl: './favorite-button.css',
  templateUrl: './favorite-button.html',
})
export class FavoriteButton {
  readonly active = input.required<boolean>();
  readonly disabled = input(false);

  readonly toggled = output<void>();

  protected readonly texts = TEXTS.favoriteButton;
}
