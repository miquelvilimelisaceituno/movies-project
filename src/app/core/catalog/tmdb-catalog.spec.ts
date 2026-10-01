import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TmdbCatalog } from './tmdb-catalog';

const emptyPage = { page: 1, results: [], total_pages: 0, total_results: 0 };

describe('TmdbCatalog', () => {
  let catalog: TmdbCatalog;
  let http: HttpTestingController;
  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    catalog = TestBed.inject(TmdbCatalog);
    http = TestBed.inject(HttpTestingController);
    TestBed.tick();
    http.expectOne('/api/tmdb/genre/movie/list').flush({ genres: [] });
    await settle();
  });

  afterEach(() => http.verify());

  it('loads genres on creation and waits for the other selections', () => {
    expect(catalog.genres.value()).toEqual({ genres: [] });
    TestBed.tick();
    http.expectNone(() => true);
  });

  it('sends filters and reacts to page changes', async () => {
    catalog.filters.set({ page: 1, with_genres: '878', 'vote_average.gte': 7 });
    const resource = catalog.movies;
    TestBed.tick();
    const first = http.expectOne(
      '/api/tmdb/discover/movie?page=1&with_genres=878&vote_average.gte=7',
    );
    expect(first.request.method).toBe('GET');
    expect(first.request.headers.has('Authorization')).toBe(false);
    expect(resource.isLoading()).toBe(true);
    first.flush(emptyPage);
    await settle();
    expect(resource.value()).toEqual(emptyPage);
    catalog.filters.update((value) => ({ ...value, page: 2 }));
    TestBed.tick();
    http
      .expectOne('/api/tmdb/discover/movie?page=2&with_genres=878&vote_average.gte=7')
      .flush({ ...emptyPage, page: 2 });
    await settle();
    expect(resource.value()?.page).toBe(2);
  });

  it('skips blank searches, encodes text, and cancels obsolete requests', async () => {
    catalog.movieQuery.set({ query: '  ' });
    const resource = catalog.movieSearch;
    TestBed.tick();
    expect(resource.status()).toBe('idle');
    http.expectNone(() => true);
    catalog.movieQuery.set({ query: 'Alien' });
    TestBed.tick();
    const obsolete = http.expectOne('/api/tmdb/search/movie?query=Alien&page=1');
    catalog.movieQuery.set({ query: ' Amélie & Alien ' });
    TestBed.tick();
    expect(obsolete.cancelled).toBe(true);
    http.expectOne('/api/tmdb/search/movie?query=Am%C3%A9lie+%26+Alien&page=1').flush(emptyPage);
    await settle();
    expect(resource.hasValue()).toBe(true);
  });

  it('shares the selection in the same service and reacts to navigation back', async () => {
    const sameCatalog = TestBed.inject(TmdbCatalog);
    expect(sameCatalog).toBe(catalog);
    expect(catalog.detail.status()).toBe('idle');
    for (const id of [550, 680, 550]) {
      catalog.selectedMovieId.set(id);
      TestBed.tick();
      http.expectOne(`/api/tmdb/movie/${id}`).flush({ id });
      await settle();
      expect(sameCatalog.detail.value()?.id).toBe(id);
    }
  });

  it('skips invalid movie and person IDs', () => {
    for (const id of [undefined, 0, -1, 1.5, NaN]) {
      catalog.selectedMovieId.set(id);
      catalog.selectedPersonId.set(id);
      TestBed.tick();
      http.expectNone(() => true);
    }
  });

  it('exposes backend errors and supports retrying', async () => {
    catalog.selectedMovieId.set(550);
    const resource = catalog.detail;
    TestBed.tick();
    http
      .expectOne('/api/tmdb/movie/550')
      .flush(
        { error: { message: 'TMDB no responde.' } },
        { status: 504, statusText: 'Gateway Timeout' },
      );
    await settle();
    expect(resource.error()).toBeTruthy();
    expect(resource.hasValue()).toBe(false);
    resource.reload();
    TestBed.tick();
    http.expectOne('/api/tmdb/movie/550').flush({ id: 550 });
    await settle();
    expect(resource.error()).toBeUndefined();
    expect(resource.value()?.id).toBe(550);
  });

  it('connects genres, trends, people, keywords and person details to their routes', async () => {
    catalog.trendingWindow.set('week');
    catalog.personQuery.set({ query: 'Scott' });
    catalog.keywordQuery.set({ query: 'space' });
    catalog.selectedPersonId.set(287);
    const resources = [
      catalog.genres,
      catalog.trending,
      catalog.personSearch,
      catalog.keywordSearch,
      catalog.personDetail,
    ];
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
    catalog.selectedMovieId.set(550);
    const resource = catalog.detail;
    TestBed.tick();
    const request = http.expectOne('/api/tmdb/movie/550');
    resource.destroy();
    expect(request.cancelled).toBe(true);
  });
});
