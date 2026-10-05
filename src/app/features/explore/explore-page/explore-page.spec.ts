import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ExplorePage } from './explore-page';

const genresUrl = '/api/tmdb/genre/movie/list';
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
const page = (results: unknown[], pageNumber = 1, totalPages = 1) => ({
  page: pageNumber,
  results,
  total_pages: totalPages,
  total_results: results.length,
});

describe('ExplorePage', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;
  let element: HTMLElement;

  const open = async (url: string) => {
    harness = await RouterTestingHarness.create(url);
    element = harness.routeNativeElement!;
    http.expectOne(genresUrl).flush({
      genres: [
        { id: 878, name: 'Ciencia ficción' },
        { id: 35, name: 'Comedia' },
      ],
    });
  };
  const settle = () => harness.fixture.whenStable();
  const waitForUrlParams = async (params: Record<string, string>) => {
    await vi.waitFor(() => expect(currentParams()).toEqual(params));
    harness.detectChanges();
  };
  const currentParams = () => {
    const router = TestBed.inject(Router);
    return router.parseUrl(router.url).queryParams;
  };
  const select = (id: string) => element.querySelector<HTMLSelectElement>(`#${id}`)!;
  const choose = (id: string, optionText: string) => {
    const options = Array.from(select(id).options);
    select(id).selectedIndex = options.findIndex((option) => option.text.includes(optionText));
    select(id).dispatchEvent(new Event('change'));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'explorar', component: ExplorePage }], withComponentInputBinding()),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the most popular movies and shows a loading message', async () => {
    await open('/explorar');
    http.expectOne(popularUrl);
    harness.detectChanges();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Cargando películas');
  });

  it('shows a card for each movie', async () => {
    await open('/explorar');
    http.expectOne(popularUrl).flush(page([alien, { ...alien, id: 679, title: 'Aliens' }]));
    await settle();
    const cards = element.querySelectorAll('app-movie-card');
    expect(cards.length).toBe(2);
    expect(cards[1].textContent).toContain('Aliens');
  });

  it('reads the filters and the page from the URL', async () => {
    await open('/explorar?genero=878&nota=7&orden=vote_average.desc&pagina=2');
    http
      .expectOne(
        '/api/tmdb/discover/movie?page=2&sort_by=vote_average.desc&with_genres=878' +
          '&vote_average.gte=7&vote_count.gte=100',
      )
      .flush(page([alien], 2, 3));
    await settle();
    expect(select('filter-genre').selectedOptions[0].text).toBe('Ciencia ficción');
    expect(select('filter-rating').selectedOptions[0].text).toContain('7');
    expect(select('filter-sort').selectedOptions[0].text).toBe('Mejor valoradas');
    expect(element.textContent).toContain('Página 2 de 3');
  });

  it('ignores invalid values in the URL', async () => {
    await open('/explorar?genero=-3&nota=50&orden=titulo&pagina=abc');
    http.expectOne(popularUrl).flush(page([alien]));
    await settle();
    expect(element.querySelectorAll('app-movie-card').length).toBe(1);
  });

  it('searches by title when the URL has a query, without using the filters', async () => {
    await open('/explorar?q=alien');
    http.expectOne('/api/tmdb/search/movie?query=alien&page=1').flush(page([alien]));
    await settle();
    expect(element.querySelector('h2')?.textContent).toContain('Resultados para «alien»');
    expect(element.querySelector<HTMLInputElement>('input[type="search"]')?.value).toBe('alien');
    expect(element.querySelector('fieldset')?.disabled).toBe(true);
    expect(element.textContent).toContain('Los filtros no se aplican al buscar por título.');
  });

  it('puts the search in the URL and removes filters and page', async () => {
    await open('/explorar?genero=878&pagina=3');
    http
      .expectOne('/api/tmdb/discover/movie?page=3&sort_by=popularity.desc&with_genres=878')
      .flush(page([alien], 3, 5));
    await settle();

    const input = element.querySelector<HTMLInputElement>('input[type="search"]')!;
    input.value = ' Alien ';
    input.dispatchEvent(new Event('input'));
    element.querySelector('form[role="search"]')!.dispatchEvent(new Event('submit'));

    await waitForUrlParams({ q: 'Alien' });
    http.expectOne('/api/tmdb/search/movie?query=Alien&page=1').flush(page([]));
    await settle();
    expect(element.textContent).toContain('No hay películas que coincidan con la búsqueda.');
  });

  it('puts a new filter in the URL and goes back to page 1', async () => {
    await open('/explorar?pagina=4');
    http
      .expectOne('/api/tmdb/discover/movie?page=4&sort_by=popularity.desc')
      .flush(page([alien], 4, 10));
    await settle();

    choose('filter-genre', 'Comedia');

    await waitForUrlParams({ genero: '35' });
    http.expectOne('/api/tmdb/discover/movie?page=1&sort_by=popularity.desc&with_genres=35');
  });

  it('resets the filters', async () => {
    await open('/explorar?genero=35&nota=6');
    http
      .expectOne(
        '/api/tmdb/discover/movie?page=1&sort_by=popularity.desc&with_genres=35&vote_average.gte=6',
      )
      .flush(page([alien]));
    await settle();

    element.querySelector<HTMLButtonElement>('fieldset button')!.click();

    await waitForUrlParams({});
    http.expectOne(popularUrl);
  });

  it('changes the page and keeps the filters', async () => {
    await open('/explorar?genero=35');
    http
      .expectOne('/api/tmdb/discover/movie?page=1&sort_by=popularity.desc&with_genres=35')
      .flush(page([alien], 1, 3));
    await settle();

    const next = Array.from(element.querySelectorAll('nav button')).find((button) =>
      button.textContent?.includes('Siguiente'),
    ) as HTMLButtonElement;
    next.click();

    await waitForUrlParams({ genero: '35', pagina: '2' });
    http.expectOne('/api/tmdb/discover/movie?page=2&sort_by=popularity.desc&with_genres=35');
    expect(document.activeElement?.id).toBe('results-title');
  });

  it('restores an earlier search when the URL changes back', async () => {
    await open('/explorar?q=alien');
    http.expectOne('/api/tmdb/search/movie?query=alien&page=1').flush(page([alien]));
    await harness.navigateByUrl('/explorar?q=amelie');
    http.expectOne('/api/tmdb/search/movie?query=amelie&page=1').flush(page([]));
    await harness.navigateByUrl('/explorar?q=alien');
    http.expectOne('/api/tmdb/search/movie?query=alien&page=1').flush(page([alien]));
    await settle();
    expect(element.querySelector<HTMLInputElement>('input[type="search"]')?.value).toBe('alien');
  });

  it('shows an empty message when TMDB returns no movies', async () => {
    await open('/explorar');
    http.expectOne(popularUrl).flush(page([]));
    await settle();
    expect(element.textContent).toContain('No hay películas que mostrar.');
    expect(element.querySelector('app-movie-card')).toBeNull();
  });

  it('shows an error and retries the request', async () => {
    await open('/explorar');
    http
      .expectOne(popularUrl)
      .flush({ error: { message: 'TMDB no responde.' } }, { status: 504, statusText: 'Timeout' });
    await settle();
    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('No se han podido cargar las películas.');

    alert?.querySelector('button')?.click();
    harness.detectChanges();
    http.expectOne(popularUrl).flush(page([alien]));
    await settle();
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelectorAll('app-movie-card').length).toBe(1);
  });
});
