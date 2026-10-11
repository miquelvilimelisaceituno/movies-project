import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Session } from '../../../core/auth/session';
import { MovieDetails } from '../../../core/catalog/models/movie';
import { TmdbCatalog } from '../../../core/catalog/tmdb-catalog';
import { PATHS } from '../../../core/config/paths';
import { TEXTS } from '../../../core/config/texts';
import { Favorites } from '../../../core/favorites/favorites';
import { TmdbImagePipe } from '../../../shared/pipes/tmdb-image-pipe';
import { FavoriteButton } from '../../../shared/ui/favorite-button/favorite-button';
import { Credits } from '../credits/credits';
import { Videos } from '../videos/videos';

@Component({
  imports: [Credits, DatePipe, DecimalPipe, FavoriteButton, RouterLink, TmdbImagePipe, Videos],
  selector: 'app-movie-page',
  styleUrl: './movie-page.css',
  templateUrl: './movie-page.html',
})
export class MoviePage {
  private readonly catalog = inject(TmdbCatalog);
  private readonly favorites = inject(Favorites);
  protected readonly router = inject(Router);

  protected readonly texts = TEXTS.movie;
  protected readonly paths = PATHS;

  readonly id = input<string>();

  protected readonly movieId = computed(() => {
    const id = Number(this.id());
    if (Number.isInteger(id) && id > 0) {
      return id;
    }
    return undefined;
  });

  
  protected readonly movie = this.catalog.movieDetails(this.movieId);

  protected readonly user = inject(Session).user;
  protected readonly favoritesStatus = this.favorites.status;
  protected readonly isFavorite = computed(() => {
    const id = this.movieId();
    return id !== undefined && this.favorites.isFavorite(id);
  });
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);

  protected async toggleFavorite(details: MovieDetails): Promise<void> {
    if (this.saving()) {
      return;
    }
    this.saving.set(true);
    this.saveError.set(false);
    try {
      await this.favorites.toggleFavorite({
        tmdbId: details.id,
        title: details.title,
        posterPath: details.poster_path,
        releaseDate: details.release_date,
      });
    } catch {
      this.saveError.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
