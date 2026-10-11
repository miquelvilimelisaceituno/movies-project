import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { FavoriteMovie } from '../../../core/favorites/favorite-movie';
import { Favorites, type FavoritesStatus } from '../../../core/favorites/favorites';
import { FavoritesPage } from './favorites-page';

const dune: FavoriteMovie = {
  tmdbId: 438631,
  title: 'Dune',
  posterPath: '/dune.jpg',
  releaseDate: '2021-09-15',
};

const arrival: FavoriteMovie = {
  tmdbId: 329865,
  title: 'La llegada',
  posterPath: null,
  releaseDate: '',
};

describe('FavoritesPage', () => {
  let fixture: ComponentFixture<FavoritesPage>;
  let favorites: ReturnType<typeof signal<FavoriteMovie[]>>;
  let status: ReturnType<typeof signal<FavoritesStatus>>;
  let toggleFavorite: ReturnType<typeof vi.fn>;

  const render = async (): Promise<HTMLElement> => {
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    favorites = signal<FavoriteMovie[]>([]);
    status = signal<FavoritesStatus>('ready');
    toggleFavorite = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [FavoritesPage],
      providers: [
        provideRouter([]),
        { provide: Favorites, useValue: { favorites, status, toggleFavorite } },
      ],
    });
    fixture = TestBed.createComponent(FavoritesPage);
  });

  it('shows a message while the favorites are loading', async () => {
    status.set('loading');
    const element = await render();
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Cargando tus favoritas…',
    );
  });

  it('shows a message when the favorites cannot be loaded', async () => {
    status.set('error');
    const element = await render();
    expect(element.textContent).toContain('No se han podido cargar tus favoritas.');
  });

  it('invites to explore when there are no favorites', async () => {
    const element = await render();
    expect(element.textContent).toContain('Todavía no tienes películas favoritas.');
    expect(element.querySelector('a[href="/explorar"]')).not.toBeNull();
  });

  it('lists the favorites with a link to each movie', async () => {
    favorites.set([dune, arrival]);
    const element = await render();
    const titles = [...element.querySelectorAll('li h2')].map((title) => title.textContent?.trim());
    expect(titles).toEqual(['Dune', 'La llegada']);
    expect(element.querySelector('a[href="/peliculas/438631"]')).not.toBeNull();
    expect(element.querySelector('li img')?.getAttribute('src')).toContain('/w185/dune.jpg');
  });

  it('shows standard texts when the poster or the date are missing', async () => {
    favorites.set([arrival]);
    const element = await render();
    expect(element.textContent).toContain('Póster no disponible');
    expect(element.textContent).toContain('Fecha desconocida');
  });

  it('removes a movie when its button is pressed', async () => {
    favorites.set([dune]);
    const element = await render();
    const button = element.querySelector('li button');
    expect(button?.getAttribute('aria-label')).toBe('Quitar: Dune');
    (button as HTMLButtonElement).click();
    expect(toggleFavorite).toHaveBeenCalledWith(dune);
  });

  it('shows a message when the movie cannot be removed', async () => {
    favorites.set([dune]);
    toggleFavorite.mockRejectedValue(new Error('permission-denied'));
    const element = await render();
    element.querySelector<HTMLButtonElement>('li button')?.click();
    await fixture.whenStable();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No se ha podido quitar la película.',
    );
  });
});
