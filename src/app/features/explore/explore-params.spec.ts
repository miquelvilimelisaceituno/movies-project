import { toGenre, toMinRating, toPage, toSort } from './explore-params';

describe('explore params', () => {
  it('reads a valid page and falls back to page 1', () => {
    expect(toPage('2')).toBe(2);
    expect(toPage('500')).toBe(500);
    for (const value of [undefined, '', 'abc', '0', '-1', '1.5', '501']) {
      expect(toPage(value)).toBe(1);
    }
  });

  it('reads a genre ID or returns null', () => {
    expect(toGenre('878')).toBe(878);
    for (const value of [undefined, '', 'abc', '0', '-3', '1.5']) {
      expect(toGenre(value)).toBeNull();
    }
  });

  it('reads a minimum rating from 1 to 9 or returns null', () => {
    expect(toMinRating('7')).toBe(7);
    for (const value of [undefined, '', 'abc', '0', '10', '7.5']) {
      expect(toMinRating(value)).toBeNull();
    }
  });

  it('accepts only known sort options', () => {
    expect(toSort('vote_average.desc')).toBe('vote_average.desc');
    for (const value of [undefined, '', 'popularity.asc', 'title']) {
      expect(toSort(value)).toBe('popularity.desc');
    }
  });
});
