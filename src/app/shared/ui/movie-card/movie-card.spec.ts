import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Movie } from '../../../core/catalog/models/movie';
import { MovieCard } from './movie-card';

const alien: Movie = {
  id: 348,
  title: 'Alien',
  original_title: 'Alien',
  overview: '',
  poster_path: '/alien.jpg',
  backdrop_path: null,
  release_date: '1979-05-25',
  vote_average: 8.15,
  vote_count: 15000,
};

describe('MovieCard', () => {
  let fixture: ComponentFixture<MovieCard>;
  let element: HTMLElement;

  const render = async (movie: Movie) => {
    fixture.componentRef.setInput('movie', movie);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MovieCard],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(MovieCard);
    element = fixture.nativeElement;
  });

  it('shows title, year, TMDB rating and poster', async () => {
    await render(alien);
    expect(element.querySelector('h3')?.textContent).toContain('Alien');
    expect(element.textContent).toContain('1979');
    expect(element.textContent).toContain('Puntuación TMDB');
    expect(element.textContent).toContain('8.2');
    expect(element.querySelector('img')?.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w342/alien.jpg',
    );
  });

  it('links the title to the movie page', async () => {
    await render(alien);
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/peliculas/348');
  });

  it('shows placeholders when poster, date or votes are missing', async () => {
    await render({ ...alien, poster_path: null, release_date: '', vote_count: 0 });
    expect(element.querySelector('img')).toBeNull();
    expect(element.textContent).toContain('Póster no disponible');
    expect(element.textContent).toContain('Fecha desconocida');
    expect(element.textContent).toContain('Sin votos');
  });
});
