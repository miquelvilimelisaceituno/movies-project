import { TmdbImagePipe } from './tmdb-image-pipe';

describe('TmdbImagePipe', () => {
  const pipe = new TmdbImagePipe();

  it('builds the image URL with the default size', () => {
    expect(pipe.transform('/poster.jpg')).toBe('https://image.tmdb.org/t/p/w342/poster.jpg');
  });

  it('accepts another size', () => {
    expect(pipe.transform('/poster.jpg', 'w185')).toBe(
      'https://image.tmdb.org/t/p/w185/poster.jpg',
    );
  });

  it('returns null when TMDB has no image', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform('')).toBeNull();
  });
});
