import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MovieSummary, Page } from '../../../core/catalog/models/movie';
import { HomePage } from './home-page';

const TRENDING_URL = '/api/tmdb/trending/movie/week';

const movie = (id: number, title: string): MovieSummary => ({
  id,
  title,
  original_title: title,
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2026-01-01',
  vote_average: 7,
  vote_count: 100,
  genre_ids: [],
});

const page = (results: MovieSummary[]): Page<MovieSummary> => ({
  page: 1,
  results,
  total_pages: 1,
  total_results: results.length,
});

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let http: HttpTestingController;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HomePage);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('shows the welcome and a link to explore', () => {
    http.expectOne(TRENDING_URL);

    expect(element.querySelector('h1')?.textContent).toContain('Abre los ojos...');
    const link = element.querySelector('a.explore-link');
    expect(link?.getAttribute('href')).toBe('/explorar');
    expect(link?.textContent).toContain('Explorar películas');
  });

  it('requests the trending movies of the week and shows a loading message', () => {
    http.expectOne(TRENDING_URL);
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')?.textContent).toContain('Cargando tendencias');
  });

  it('shows a card for each trending movie', async () => {
    http.expectOne(TRENDING_URL).flush(page([movie(1, 'Alien'), movie(2, 'Gladiator')]));
    await fixture.whenStable();

    const titles = Array.from(element.querySelectorAll('.grid h3'), (title) =>
      title.textContent?.trim(),
    );
    expect(titles).toEqual(['Alien', 'Gladiator']);
    expect(element.querySelector('a[href="/peliculas/1"]')).not.toBeNull();
  });

  it('shows a message when there are no trending movies', async () => {
    http.expectOne(TRENDING_URL).flush(page([]));
    await fixture.whenStable();

    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'No hay tendencias que mostrar.',
    );
    expect(element.querySelector('.grid')).toBeNull();
  });

  it('shows an error and retries the request', async () => {
    http
      .expectOne(TRENDING_URL)
      .flush({ error: { message: 'TMDB no responde.' } }, { status: 504, statusText: 'Timeout' });
    await fixture.whenStable();
    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('No se han podido cargar las tendencias.');

    alert?.querySelector('button')?.click();
    fixture.detectChanges();
    http.expectOne(TRENDING_URL).flush(page([movie(1, 'Alien')]));
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelector('.grid h3')?.textContent).toContain('Alien');
  });
});
