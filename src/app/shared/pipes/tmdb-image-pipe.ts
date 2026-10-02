import { Pipe, PipeTransform } from '@angular/core';
import { TMDB_IMAGE_BASE_URL, TmdbImageSize } from '../../core/config/api';


@Pipe({
  name: 'tmdbImage',
})
export class TmdbImagePipe implements PipeTransform {
  transform(path: string | null | undefined, size: TmdbImageSize = 'w342'): string | null {
    return path ? `${TMDB_IMAGE_BASE_URL}${size}${path}` : null;
  }
}
