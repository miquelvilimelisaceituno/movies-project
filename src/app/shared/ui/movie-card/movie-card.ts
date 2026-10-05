import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TEXTS } from '../../../core/config/texts';
import { Movie } from '../../../core/catalog/models/movie';
import { TmdbImagePipe } from '../../pipes/tmdb-image-pipe';
import { YearPipe } from '../../pipes/year-pipe';

@Component({
  imports: [DecimalPipe, RouterLink, TmdbImagePipe, YearPipe],
  selector: 'app-movie-card',
  styleUrl: './movie-card.css',
  templateUrl: './movie-card.html',
})
export class MovieCard {
  readonly movie = input.required<Movie>();

  protected readonly texts = TEXTS.movieCard;
}
