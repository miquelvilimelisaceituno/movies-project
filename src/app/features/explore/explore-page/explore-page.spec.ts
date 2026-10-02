import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ExplorePage } from './explore-page';

const popularUrl = '/api/tmdb/discover/movie?page=1&sort_by=popularity.desc';
const alien = {
  id: 348,
  title: 'Alien',
  original_title: 'Alien',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '1979-05-25',
  vote_average: 8.1,
  vote_count: 15000,
  genre_ids: [878],
};
const page = (results: unknown[]) => ({
  page: 1,
  results,
  total_pages: 1,
  total_results: results.length,
});

describe('ExplorePage', () => {
  let fixture: ComponentFixture<ExplorePage>;
  let http: HttpTestingController;
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ExplorePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ExplorePage);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('requests the most popular movies and shows a loading message', () => {
    http.expectOne(popularUrl);
    fixture.detectChanges();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Cargando películas');
  });

  it('shows a card for each movie', async () => {
    http.expectOne(popularUrl).flush(page([alien, { ...alien, id: 679, title: 'Aliens' }]));
    await fixture.whenStable();
    const cards = element.querySelectorAll('app-movie-card');
    expect(cards.length).toBe(2);
    expect(cards[1].textContent).toContain('Aliens');
  });

  it('shows an empty message when TMDB returns no movies', async () => {
    http.expectOne(popularUrl).flush(page([]));
    await fixture.whenStable();
    expect(element.textContent).toContain('No hay películas que mostrar.');
    expect(element.querySelector('app-movie-card')).toBeNull();
  });

  it('shows an error and retries the request', async () => {
    http
      .expectOne(popularUrl)
      .flush({ error: { message: 'TMDB no responde.' } }, { status: 504, statusText: 'Timeout' });
    await fixture.whenStable();
    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('No se han podido cargar las películas.');

    alert?.querySelector('button')?.click();
    fixture.detectChanges();
    http.expectOne(popularUrl).flush(page([alien]));
    await fixture.whenStable();
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelectorAll('app-movie-card').length).toBe(1);
  });
});
