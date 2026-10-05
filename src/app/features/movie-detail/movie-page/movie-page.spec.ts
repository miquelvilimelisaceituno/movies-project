import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MovieDetails } from '../../../core/catalog/models/movie';
import { MoviePage } from './movie-page';

const alien: MovieDetails = {
  id: 348,
  title: 'Alien, el octavo pasajero',
  original_title: 'Alien',
  overview: 'La tripulación de la Nostromo recibe una señal.',
  poster_path: '/alien.jpg',
  backdrop_path: null,
  release_date: '1979-05-25',
  vote_average: 8.15,
  vote_count: 15000,
  genres: [{ id: 878, name: 'Ciencia ficción' }],
  runtime: 117,
  tagline: 'En el espacio nadie puede oír tus gritos.',
  credits: { cast: [], crew: [] },
  videos: { results: [] },
};

describe('MoviePage', () => {
  let fixture: ComponentFixture<MoviePage>;
  let http: HttpTestingController;
  let element: HTMLElement;

  // Simula lo que hace el router: poner el :id de la URL en el input "id".
  const openUrlWithId = (id: string) => {
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MoviePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MoviePage);
    element = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  it('requests the movie of the URL and shows a loading message', () => {
    openUrlWithId('348');
    http.expectOne('/api/tmdb/movie/348');
    fixture.detectChanges();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Cargando película');
  });

  it('shows the movie details', async () => {
    openUrlWithId('348');
    http.expectOne('/api/tmdb/movie/348').flush(alien);
    await fixture.whenStable();

    expect(element.querySelector('h1')?.textContent).toContain('Alien, el octavo pasajero');
    expect(element.textContent).toContain('Título original: Alien');
    expect(element.textContent).toContain('En el espacio nadie puede oír tus gritos.');
    expect(element.textContent).toContain('25/05/1979');
    expect(element.textContent).toContain('117 min');
    expect(element.textContent).toContain('Ciencia ficción');
    expect(element.textContent).toContain('8.2');
    expect(element.textContent).toContain('La tripulación de la Nostromo recibe una señal.');
    expect(element.querySelector('img.poster')?.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w500/alien.jpg',
    );
    expect(element.querySelector('app-credits')).not.toBeNull();
    expect(element.querySelector('app-videos')).not.toBeNull();
  });

  it('shows "no disponible" when TMDB has no data', async () => {
    openUrlWithId('348');
    http.expectOne('/api/tmdb/movie/348').flush({
      ...alien,
      original_title: alien.title,
      overview: '',
      poster_path: null,
      release_date: '',
      runtime: null,
      tagline: '',
      genres: [],
      vote_count: 0,
    });
    await fixture.whenStable();

    expect(element.querySelector('img.poster')).toBeNull();
    expect(element.textContent).toContain('Póster no disponible');
    expect(element.textContent).toContain('No disponible');
    expect(element.textContent).toContain('Sin votos');
    expect(element.textContent).not.toContain('Título original');
  });

  it('shows a message and makes no request when the ID is not valid', () => {
    for (const id of ['abc', '0', '-5', '1.5']) {
      openUrlWithId(id);
      http.expectNone(() => true);
      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'La dirección no corresponde a ninguna película.',
      );
    }
  });

  it('shows an error and retries the request', async () => {
    openUrlWithId('348');
    http
      .expectOne('/api/tmdb/movie/348')
      .flush({ error: { message: 'TMDB no responde.' } }, { status: 504, statusText: 'Timeout' });
    await fixture.whenStable();
    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('No se ha podido cargar la película.');

    alert?.querySelector('button')?.click();
    fixture.detectChanges();
    http.expectOne('/api/tmdb/movie/348').flush(alien);
    await fixture.whenStable();
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelector('h1')?.textContent).toContain('Alien');
  });

  it('loads the new movie when the ID of the URL changes', async () => {
    openUrlWithId('348');
    http.expectOne('/api/tmdb/movie/348').flush(alien);
    await fixture.whenStable();

    openUrlWithId('679');
    http.expectOne('/api/tmdb/movie/679').flush({ ...alien, id: 679, title: 'Aliens' });
    await fixture.whenStable();
    expect(element.querySelector('h1')?.textContent).toContain('Aliens');
  });
});
