import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TEXTS } from '../../../core/config/texts';
import { FavoriteMovie } from '../../../core/favorites/favorite-movie';
import { Favorites } from '../../../core/favorites/favorites';
import { TmdbImagePipe } from '../../../shared/pipes/tmdb-image-pipe';
import { YearPipe } from '../../../shared/pipes/year-pipe';

@Component({
  imports: [RouterLink, TmdbImagePipe, YearPipe],
  selector: 'app-favorites-page',
  styleUrl: './favorites-page.css',
  templateUrl: './favorites-page.html',
})
export class FavoritesPage {
  private readonly favoritesService = inject(Favorites);

  protected readonly texts = TEXTS.favorites;
  protected readonly favorites = this.favoritesService.favorites;
  protected readonly status = this.favoritesService.status;
  protected readonly removeError = signal(false);

  protected async remove(movie: FavoriteMovie): Promise<void> {
    this.removeError.set(false);
    try {
      await this.favoritesService.toggleFavorite(movie);
    } catch {
      this.removeError.set(true);
    }
  }
}
