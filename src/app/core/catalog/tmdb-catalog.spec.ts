import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DiscoverFilters, SearchQuery } from './models/movie';
import { TmdbCatalog } from './tmdb-catalog';

const emptyPage = { page: 1, results: [], total_pages: 0, total_results: 0 };

describe('TmdbCatalog', () => {
  let catalog: TmdbCatalog;
  let http: HttpTestingController;
  const settle = () => TestBed.inject(ApplicationRef).whenStable();
  // Los componentes crean los recursos al inicializar sus propiedades;
  // en los tests se reproduce ese contexto de inyección.
  const create = <T>(factory: () => T) => TestBed.runInInjectionContext(factory);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    catalog = TestBed.inject(TmdbCatalog);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('does not send requests until a component creates a resource', () => {
    TestBed.tick();
    http.expectNone(() => true);
  });

  it('loads genres when a component asks for them', async () => {
    const genres = create(() => catalog.genres());
    TestBed.tick();
    http
      .expectOne('/api/tmdb/genre/movie/list')
      .flush({ genres: [{ id: 878, name: 'Ciencia ficción' }] });
    await settle();
    expect(genres.value()?.genres[0].id).toBe(878);
  });

  it('sends the filters owned by the component and reacts to page changes', async () => {
    const filters = signal<DiscoverFilters | undefined>(undefined);
    const movies = create(() => catalog.discoverMovies(filters));
    TestBed.tick();
    http.expectNone(() => true);

    filters.set({ page: 1, with_genres: '878', 'vote_average.gte': 7 });
    TestBed.tick();
    const first = http.expectOne(
      '/api/tmdb/discover/movie?page=1&with_genres=878&vote_average.gte=7',
    );
    expect(first.request.method).toBe('GET');
    expect(first.request.headers.has('Authorization')).toBe(false);
    expect(movies.isLoading()).toBe(true);
    first.flush(emptyPage);
    await settle();
    expect(movies.value()).toEqual(emptyPage);

    filters.update((value) => ({ ...value, page: 2 }));
    TestBed.tick();
    http
      .expectOne('/api/tmdb/discover/movie?page=2&with_genres=878&vote_average.gte=7')
      .flush({ ...emptyPage, page: 2 });
    await settle();
    expect(movies.value()?.page).toBe(2);
  });

  it('skips blank searches, encodes text, and cancels obsolete requests', async () => {
    const query = signal<SearchQuery>({ query: '  ' });
    const search = create(() => catalog.searchMovies(query));
    TestBed.tick();
    expect(search.status()).toBe('idle');
    http.expectNone(() => true);

    query.set({ query: 'Alien' });
    TestBed.tick();
    const obsolete = http.expectOne('/api/tmdb/search/movie?query=Alien&page=1');
    query.set({ query: ' Amélie & Alien ' });
    TestBed.tick();
    expect(obsolete.cancelled).toBe(true);
    http.expectOne('/api/tmdb/search/movie?query=Am%C3%A9lie+%26+Alien&page=1').flush(emptyPage);
    await settle();
    expect(search.hasValue()).toBe(true);
  });

  it('keeps the selections of two components independent', async () => {
    const firstId = signal<number | undefined>(550);
    const secondId = signal<number | undefined>(680);
    const first = create(() => catalog.movieDetails(firstId));
    const second = create(() => catalog.movieDetails(secondId));
    TestBed.tick();
    http.expectOne('/api/tmdb/movie/550').flush({ id: 550 });
    http.expectOne('/api/tmdb/movie/680').flush({ id: 680 });
    await settle();
    expect(first.value()?.id).toBe(550);
    expect(second.value()?.id).toBe(680);
  });

  it('reacts when the route ID changes and when navigating back', async () => {
    const id = signal<number | undefined>(undefined);
    const detail = create(() => catalog.movieDetails(id));
    expect(detail.status()).toBe('idle');
    for (const value of [550, 680, 550]) {
      id.set(value);
      TestBed.tick();
      http.expectOne(`/api/tmdb/movie/${value}`).flush({ id: value });
      await settle();
      expect(detail.value()?.id).toBe(value);
    }
  });

  it('skips invalid movie and person IDs', () => {
    const id = signal<number | undefined>(undefined);
    create(() => [catalog.movieDetails(id), catalog.personDetails(id)]);
    for (const value of [undefined, 0, -1, 1.5, NaN]) {
      id.set(value);
      TestBed.tick();
      http.expectNone(() => true);
    }
  });

  it('exposes backend errors and supports retrying', async () => {
    const detail = create(() => catalog.movieDetails(() => 550));
    TestBed.tick();
    http
      .expectOne('/api/tmdb/movie/550')
      .flush(
        { error: { message: 'TMDB no responde.' } },
        { status: 504, statusText: 'Gateway Timeout' },
      );
    await settle();
    expect(detail.error()).toBeTruthy();
    expect(detail.hasValue()).toBe(false);
    detail.reload();
    TestBed.tick();
    http.expectOne('/api/tmdb/movie/550').flush({ id: 550 });
    await settle();
    expect(detail.error()).toBeUndefined();
    expect(detail.value()?.id).toBe(550);
  });

  it('connects trends, people, keywords and person details to their routes', async () => {
    const resources = create(() => [
      catalog.trendingMovies(() => 'week'),
      catalog.searchPeople(() => ({ query: 'Scott' })),
      catalog.searchKeywords(() => ({ query: 'space' })),
      catalog.personDetails(() => 287),
    ]);
    TestBed.tick();
    http.expectOne('/api/tmdb/trending/movie/week').flush(emptyPage);
    http.expectOne('/api/tmdb/search/person?query=Scott&page=1').flush(emptyPage);
    http.expectOne('/api/tmdb/search/keyword?query=space&page=1').flush(emptyPage);
    http
      .expectOne('/api/tmdb/person/287')
      .flush({ id: 287, movie_credits: { cast: [], crew: [] } });
    await settle();
    expect(resources.every((resource) => resource.status() === 'resolved')).toBe(true);
  });

  it('cancels a request when its resource is destroyed', () => {
    const detail = create(() => catalog.movieDetails(() => 550));
    TestBed.tick();
    const request = http.expectOne('/api/tmdb/movie/550');
    detail.destroy();
    expect(request.cancelled).toBe(true);
  });
});
