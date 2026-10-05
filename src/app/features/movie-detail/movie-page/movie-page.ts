import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TmdbCatalog } from '../../../core/catalog/tmdb-catalog';
import { TEXTS } from '../../../core/config/texts';
import { TmdbImagePipe } from '../../../shared/pipes/tmdb-image-pipe';
import { Credits } from '../credits/credits';
import { Videos } from '../videos/videos';

@Component({
  imports: [Credits, DatePipe, DecimalPipe, RouterLink, TmdbImagePipe, Videos],
  selector: 'app-movie-page',
  styleUrl: './movie-page.css',
  templateUrl: './movie-page.html',
})
export class MoviePage {
  private readonly catalog = inject(TmdbCatalog);

  protected readonly texts = TEXTS.movie;

  readonly id = input<string>();

  protected readonly movieId = computed(() => {
    const id = Number(this.id());
    if (Number.isInteger(id) && id > 0) {
      return id;
    }
    return undefined;
  });

  
  protected readonly movie = this.catalog.movieDetails(this.movieId);
}
