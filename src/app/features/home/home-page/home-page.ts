import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TmdbCatalog } from '../../../core/catalog/tmdb-catalog';
import { TEXTS } from '../../../core/config/texts';
import { MovieCard } from '../../../shared/ui/movie-card/movie-card';

@Component({
  imports: [MovieCard, RouterLink],
  selector: 'app-home-page',
  styleUrl: './home-page.css',
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly catalog = inject(TmdbCatalog);

  protected readonly texts = TEXTS.home;

  protected readonly trending = this.catalog.trendingMovies(() => 'week');
}
