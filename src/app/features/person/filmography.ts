import { Movie } from '../../core/catalog/models/movie';

export function newestFirst(a: Movie, b: Movie) {
  return b.release_date.localeCompare(a.release_date);
}
