import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { AppUser } from '../../../core/auth/app-user';
import { Session } from '../../../core/auth/session';
import { MovieDetails } from '../../../core/catalog/models/movie';
import { Favorites, type FavoritesStatus } from '../../../core/favorites/favorites';
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

const ana: AppUser = { uid: 'u1', email: 'ana@movies.dev', displayName: 'Ana', photoUrl: null };

describe('MoviePage', () => {
  let fixture: ComponentFixture<MoviePage>;
  let http: HttpTestingController;
  let element: HTMLElement;
  let user: ReturnType<typeof signal<AppUser | null | undefined>>;
  let favoriteIds: ReturnType<typeof signal<number[]>>;
  let favoritesStatus: ReturnType<typeof signal<FavoritesStatus>>;
  let toggleFavorite: ReturnType<typeof vi.fn>;

  // Simula lo que hace el router: poner el :id de la URL en el input "id".
  const openUrlWithId = (id: string) => {
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
  };

  const showAlien = async () => {
    openUrlWithId('348');
    http.expectOne('/api/tmdb/movie/348').flush(alien);
    await fixture.whenStable();
  };
  const favoriteButton = () =>
    element.querySelector<HTMLButtonElement>('app-favorite-button button');

  beforeEach(() => {
    user = signal<AppUser | null | undefined>(null);
    favoriteIds = signal<number[]>([]);
    favoritesStatus = signal<FavoritesStatus>('ready');
    toggleFavorite = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [MoviePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'peliculas/:id', children: [] }]),
        { provide: Session, useValue: { user } },
        {
          provide: Favorites,
          useValue: {
            status: favoritesStatus,
            isFavorite: (id: number) => favoriteIds().includes(id),
            toggleFavorite,
          },
        },
      ],
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

  describe('favorite', () => {
    it('invites visitors to log in and come back to the movie', async () => {
      await TestBed.inject(Router).navigateByUrl('/peliculas/348');
      await showAlien();
      expect(favoriteButton()).toBeNull();
      const link = element.querySelector<HTMLAnchorElement>('.favorite a');
      expect(link?.textContent).toContain('Inicia sesión para guardarla en favoritas');
      expect(link?.getAttribute('href')).toBe('/iniciar-sesion?returnUrl=%2Fpeliculas%2F348');
    });

    it('shows nothing while the session is being restored', async () => {
      user.set(undefined);
      await showAlien();
      expect(element.querySelector('.favorite')).toBeNull();
    });

    it('shows whether the movie is a favorite', async () => {
      user.set(ana);
      await showAlien();
      expect(favoriteButton()?.getAttribute('aria-pressed')).toBe('false');

      favoriteIds.set([348]);
      await fixture.whenStable();
      expect(favoriteButton()?.getAttribute('aria-pressed')).toBe('true');
    });

    it('saves the movie summary when the button is pressed', async () => {
      user.set(ana);
      await showAlien();
      favoriteButton()?.click();
      expect(toggleFavorite).toHaveBeenCalledWith({
        tmdbId: 348,
        title: 'Alien, el octavo pasajero',
        posterPath: '/alien.jpg',
        releaseDate: '1979-05-25',
      });
    });

    it('ignores new clicks while a change is being saved', async () => {
      user.set(ana);
      toggleFavorite.mockReturnValue(new Promise(() => {}));
      await showAlien();
      favoriteButton()?.click();
      favoriteButton()?.click();
      expect(toggleFavorite).toHaveBeenCalledTimes(1);
    });

    it('disables the button while the favorites are loading', async () => {
      user.set(ana);
      favoritesStatus.set('loading');
      await showAlien();
      expect(favoriteButton()?.disabled).toBe(true);
    });

    it('explains when the favorites cannot be loaded', async () => {
      user.set(ana);
      favoritesStatus.set('error');
      await showAlien();
      expect(element.querySelector('.favorite [role="alert"]')?.textContent).toContain(
        'No se han podido cargar tus favoritas.',
      );
    });

    it('explains when the change cannot be saved', async () => {
      user.set(ana);
      toggleFavorite.mockRejectedValue(new Error('permission-denied'));
      await showAlien();
      favoriteButton()?.click();
      await fixture.whenStable();
      expect(element.querySelector('.favorite [role="alert"]')?.textContent).toContain(
        'No se ha podido guardar el cambio.',
      );
    });
  });
});
