import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TmdbCatalog } from '../../../core/catalog/tmdb-catalog';
import { TEXTS } from '../../../core/config/texts';
import { TmdbImagePipe } from '../../../shared/pipes/tmdb-image-pipe';
import { MovieCard } from '../../../shared/ui/movie-card/movie-card';
import { newestFirst } from '../filmography';

@Component({
  imports: [DatePipe, MovieCard, RouterLink, TmdbImagePipe],
  selector: 'app-person-page',
  styleUrl: './person-page.css',
  templateUrl: './person-page.html',
})
export class PersonPage {
  private readonly catalog = inject(TmdbCatalog);

  protected readonly texts = TEXTS.person;

  readonly id = input<string>();

  protected readonly personId = computed(() => {
    const id = Number(this.id());
    if (Number.isInteger(id) && id > 0) {
      return id;
    }
    return undefined;
  });

  protected readonly person = this.catalog.personDetails(this.personId);

  protected readonly actingMovies = computed(() => {
    if (!this.person.hasValue()) {
      return [];
    }
    const movies = [...this.person.value().movie_credits.cast];
    return movies.sort(newestFirst);
  });

  protected readonly directedMovies = computed(() => {
    if (!this.person.hasValue()) {
      return [];
    }
    const crew = this.person.value().movie_credits.crew;
    const movies = crew.filter((movie) => movie.job === 'Director');
    return movies.sort(newestFirst);
  });
}
