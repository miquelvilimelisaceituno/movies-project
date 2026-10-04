import { Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { Params, Router } from '@angular/router';
import { TmdbCatalog } from '../../../core/catalog/tmdb-catalog';
import { TEXTS } from '../../../core/config/texts';
import { MovieCard } from '../../../shared/ui/movie-card/movie-card';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import {
  DEFAULT_SORT,
  ExploreFilters,
  MAX_PAGE,
  MIN_VOTES_TO_SORT,
  toGenre,
  toMinRating,
  toPage,
  toSort,
} from '../explore-params';
import { FiltersPanel } from '../filters-panel/filters-panel';
import { SearchBox } from '../search-box/search-box';

@Component({
  imports: [FiltersPanel, MovieCard, Pagination, SearchBox],
  selector: 'app-explore-page',
  styleUrl: './explore-page.css',
  templateUrl: './explore-page.html',
})
export class ExplorePage {
  private readonly catalog = inject(TmdbCatalog);
  private readonly router = inject(Router);

  protected readonly texts = TEXTS.explore;

  readonly q = input<string>();
  readonly pagina = input<string>();
  readonly genero = input<string>();
  readonly nota = input<string>();
  readonly orden = input<string>();

  protected readonly query = computed(() => (this.q() ?? '').trim());
  protected readonly page = computed(() => toPage(this.pagina()));
  protected readonly filters = computed<ExploreFilters>(() => ({
    genre: toGenre(this.genero()),
    minRating: toMinRating(this.nota()),
    sort: toSort(this.orden()),
  }));

  protected readonly isSearching = computed(() => this.query() !== '');

  protected readonly genres = this.catalog.genres();

  private readonly searchResults = this.catalog.searchMovies(() => ({
    query: this.query(),
    page: this.page(),
  }));

  private readonly discoverResults = this.catalog.discoverMovies(() => {
    if (this.isSearching()) {
      return undefined;
    }
    const filters = this.filters();
    return {
      page: this.page(),
      sort_by: filters.sort,
      with_genres: filters.genre?.toString(),
      'vote_average.gte': filters.minRating ?? undefined,
      'vote_count.gte': filters.sort === DEFAULT_SORT ? undefined : MIN_VOTES_TO_SORT,
    };
  });

  protected readonly movies = computed(() =>
    this.isSearching() ? this.searchResults : this.discoverResults,
  );

  protected readonly genreList = computed(() =>
    this.genres.hasValue() ? this.genres.value().genres : [],
  );

  protected readonly totalPages = computed(() => {
    const movies = this.movies();
    if (!movies.hasValue()) {
      return 1;
    }
    return Math.min(movies.value().total_pages, MAX_PAGE);
  });

  private readonly resultsTitle = viewChild.required<ElementRef<HTMLElement>>('resultsTitle');

  protected search(text: string) {
    this.updateUrl({ q: text || null, pagina: null, genero: null, nota: null, orden: null });
  }

  protected changeFilters(filters: ExploreFilters) {
    this.updateUrl({
      genero: filters.genre,
      nota: filters.minRating,
      orden: filters.sort === DEFAULT_SORT ? null : filters.sort,
      pagina: null,
    });
  }

  protected resetFilters() {
    this.updateUrl({ genero: null, nota: null, orden: null, pagina: null });
  }

  protected changePage(page: number) {
    this.updateUrl({ pagina: page === 1 ? null : page });
    this.resultsTitle().nativeElement.focus();
  }

  private updateUrl(params: Params) {
    this.router.navigate(['/explorar'], { queryParams: params, queryParamsHandling: 'merge' });
  }
}
