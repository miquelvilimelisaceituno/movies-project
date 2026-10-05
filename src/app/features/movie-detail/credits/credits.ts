import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CastMember, CrewMember } from '../../../core/catalog/models/movie';
import { TEXTS } from '../../../core/config/texts';
import { TmdbImagePipe } from '../../../shared/pipes/tmdb-image-pipe';

@Component({
  imports: [RouterLink, TmdbImagePipe],
  selector: 'app-credits',
  styleUrl: './credits.css',
  templateUrl: './credits.html',
})
export class Credits {
  readonly cast = input.required<CastMember[]>();
  readonly crew = input.required<CrewMember[]>();

  protected readonly texts = TEXTS.credits;

  protected readonly mainCast = computed(() => this.cast().slice(0, 10));

  protected readonly directors = computed(() =>
    this.crew().filter((person) => person.job === 'Director'),
  );
}
