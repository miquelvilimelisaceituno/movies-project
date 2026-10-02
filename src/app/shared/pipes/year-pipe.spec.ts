import { YearPipe } from './year-pipe';

describe('YearPipe', () => {
  const pipe = new YearPipe();

  it('extracts the year from a TMDB date', () => {
    expect(pipe.transform('1979-05-25')).toBe(1979);
  });

  it('returns null when the date is missing or invalid', () => {
    for (const date of ['', null, undefined, 'sin fecha']) {
      expect(pipe.transform(date)).toBeNull();
    }
  });
});
