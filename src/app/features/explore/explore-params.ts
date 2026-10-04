export type SortOption = 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc';

export const SORT_OPTIONS: SortOption[] = [
  'popularity.desc',
  'vote_average.desc',
  'primary_release_date.desc',
];

export const DEFAULT_SORT: SortOption = 'popularity.desc';

export const MAX_PAGE = 500;

export const MIN_VOTES_TO_SORT = 100;

export interface ExploreFilters {
  genre: number | null;
  minRating: number | null;
  sort: SortOption;
}

export function toPage(value: string | undefined): number {
  const page = Number(value);
  if (Number.isInteger(page) && page >= 1 && page <= MAX_PAGE) {
    return page;
  }
  return 1;
}

export function toGenre(value: string | undefined): number | null {
  const genre = Number(value);
  if (Number.isInteger(genre) && genre > 0) {
    return genre;
  }
  return null;
}

export function toMinRating(value: string | undefined): number | null {
  const rating = Number(value);
  if (Number.isInteger(rating) && rating >= 1 && rating <= 9) {
    return rating;
  }
  return null;
}

export function toSort(value: string | undefined): SortOption {
  return SORT_OPTIONS.find((option) => option === value) ?? DEFAULT_SORT;
}
