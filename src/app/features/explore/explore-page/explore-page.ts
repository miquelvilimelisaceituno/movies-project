import { Component, inject, signal } from '@angular/core';
import { DiscoverFilters } from '../../../core/catalog/models/movie';
import { TmdbCatalog } from '../../../core/catalog/tmdb-catalog';
import { TEXTS } from '../../../core/config/texts';
import { MovieCard } from '../../../shared/ui/movie-card/movie-card';

@Component({
  imports: [MovieCard],
  selector: 'app-explore-page',
  styleUrl: './explore-page.css',
  templateUrl: './explore-page.html',
})
export class ExplorePage {
  private readonly catalog = inject(TmdbCatalog);

  protected readonly texts = TEXTS.explore;

  protected readonly filters = signal<DiscoverFilters>({ page: 1, sort_by: 'popularity.desc' });
  protected readonly movies = this.catalog.discoverMovies(this.filters);
}
