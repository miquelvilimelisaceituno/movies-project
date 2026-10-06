import { Movie } from '../../core/catalog/models/movie';
import { newestFirst } from './filmography';

const movie = (title: string, release_date: string): Movie => ({
  id: 1,
  title,
  original_title: title,
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date,
  vote_average: 0,
  vote_count: 0,
});

describe('filmography', () => {
  it('sorts movies from newest to oldest', () => {
    const movies = [movie('Alien', '1979-05-25'), movie('Gladiator', '2000-05-01')];

    const titles = movies.sort(newestFirst).map((item) => item.title);

    expect(titles).toEqual(['Gladiator', 'Alien']);
  });

  it('puts movies without a release date at the end', () => {
    const movies = [movie('Sin fecha', ''), movie('Alien', '1979-05-25')];

    const titles = movies.sort(newestFirst).map((item) => item.title);

    expect(titles).toEqual(['Alien', 'Sin fecha']);
  });
});
