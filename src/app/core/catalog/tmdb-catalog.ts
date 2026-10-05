import { httpResource } from '@angular/common/http';
import { Service } from '@angular/core';
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
} from './models/movie';

@Service()
export class TmdbCatalog {
  private readonly baseUrl = '/api/tmdb';

  genres() {
    return httpResource<{ genres: Genre[] }>(() => this.url('/genre/movie/list'));
  }

  discoverMovies(filters: () => DiscoverFilters | undefined) {
    return httpResource<Page<MovieSummary>>(() => {
      const value = filters();
      return value === undefined ? undefined : this.url('/discover/movie', { ...value });
    });
  }

  trendingMovies(window: () => 'day' | 'week' | undefined) {
    return httpResource<Page<MovieSummary>>(() => {
      const value = window();
      return value === undefined ? undefined : this.url(`/trending/movie/${value}`);
    });
  }

  searchMovies(search: () => SearchQuery) {
    return httpResource<Page<MovieSummary>>(() => this.searchUrl('/search/movie', search()));
  }

  searchPeople(search: () => SearchQuery) {
    return httpResource<Page<PersonSummary>>(() => this.searchUrl('/search/person', search()));
  }

  searchKeywords(search: () => SearchQuery) {
    return httpResource<Page<Keyword>>(() => this.searchUrl('/search/keyword', search()));
  }

  movieDetails(id: () => number | undefined) {
    return httpResource<MovieDetails>(() => this.detailUrl('/movie', id()));
  }

  personDetails(id: () => number | undefined) {
    return httpResource<PersonDetails>(() => this.detailUrl('/person', id()));
  }

  private searchUrl(path: string, search: SearchQuery) {
    const query = search.query.trim();
    return query ? this.url(path, { query, page: search.page ?? 1 }) : undefined;
  }

  private detailUrl(path: string, id: number | undefined) {
    return id !== undefined && Number.isSafeInteger(id) && id > 0
      ? this.url(`${path}/${id}`)
      : undefined;
  }

  private url(path: string, params: Record<string, string | number | undefined> = {}) {
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
