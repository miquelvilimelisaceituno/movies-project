import { httpResource } from '@angular/common/http';
import { Service, signal } from '@angular/core';
import {
  DiscoverFilters,
  Genre,
  Keyword,
  MovieDetails,
  MovieSummary,
  Page,
  PersonDetails,
  PersonSummary,
  SearchQuery,
} from '../models/tmdb-models';

@Service()
export class TmdbCatalog {
  private readonly baseUrl = '/api/tmdb';

  
  readonly filters = signal<DiscoverFilters | undefined>(undefined);
  readonly movieQuery = signal<SearchQuery>({ query: '' });
  readonly personQuery = signal<SearchQuery>({ query: '' });
  readonly keywordQuery = signal<SearchQuery>({ query: '' });
  readonly trendingWindow = signal<'day' | 'week' | undefined>(undefined);
  readonly selectedMovieId = signal<number | undefined>(undefined);
  readonly selectedPersonId = signal<number | undefined>(undefined);

  readonly movies = httpResource<Page<MovieSummary>>(() => {
    const filters = this.filters();
    return filters === undefined ? undefined : this.url('/discover/movie', { ...filters });
  });

  readonly movieSearch = httpResource<Page<MovieSummary>>(() => {
    const search = this.movieQuery();
    const query = search.query.trim();
    return query ? this.url('/search/movie', { query, page: search.page ?? 1 }) : undefined;
  });

  readonly personSearch = httpResource<Page<PersonSummary>>(() => {
    const search = this.personQuery();
    const query = search.query.trim();
    return query ? this.url('/search/person', { query, page: search.page ?? 1 }) : undefined;
  });

  readonly keywordSearch = httpResource<Page<Keyword>>(() => {
    const search = this.keywordQuery();
    const query = search.query.trim();
    return query ? this.url('/search/keyword', { query, page: search.page ?? 1 }) : undefined;
  });

  
  readonly genres = httpResource<{ genres: Genre[] }>(() => this.url('/genre/movie/list'));

  readonly trending = httpResource<Page<MovieSummary>>(() => {
    const window = this.trendingWindow();
    return window === undefined ? undefined : this.url(`/trending/movie/${window}`);
  });

  readonly detail = httpResource<MovieDetails>(() => {
    const id = this.selectedMovieId();
    return id !== undefined && Number.isSafeInteger(id) && id > 0
      ? this.url(`/movie/${id}`)
      : undefined;
  });

  readonly personDetail = httpResource<PersonDetails>(() => {
    const id = this.selectedPersonId();
    return id !== undefined && Number.isSafeInteger(id) && id > 0
      ? this.url(`/person/${id}`)
      : undefined;
  });

  private url(path: string, params: Record<string, string | number | undefined> = {},) {
    const query = new URLSearchParams();

    for (const key of Object.keys(params)) {
      const value = params[key];

      if (value !== undefined) {
        query.set(key, String(value));
      }
    }

    const fullPath = `${this.baseUrl}${path}`;
    const queryString = query.toString();

    if (queryString === '') {
      return fullPath;
    }

    return `${fullPath}?${queryString}`;
  }
  
}
