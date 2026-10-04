import { Component, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Genre } from '../../../core/catalog/models/movie';
import { TEXTS } from '../../../core/config/texts';
import { DEFAULT_SORT, ExploreFilters, SORT_OPTIONS, SortOption } from '../explore-params';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-filters-panel',
  styleUrl: './filters-panel.css',
  templateUrl: './filters-panel.html',
})
export class FiltersPanel {
  readonly genres = input.required<Genre[]>();
  readonly filters = input.required<ExploreFilters>();
  readonly disabled = input(false);

  readonly filtersChange = output<ExploreFilters>();
  readonly reset = output<void>();

  protected readonly texts = TEXTS.filters;
  protected readonly ratingOptions = [5, 6, 7, 8, 9];
  protected readonly sortOptions = SORT_OPTIONS;

  protected readonly form = new FormGroup({
    genre: new FormControl<number | null>(null),
    minRating: new FormControl<number | null>(null),
    sort: new FormControl<SortOption>(DEFAULT_SORT, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const filters = this.filters();
      this.form.setValue(
        { genre: filters.genre, minRating: filters.minRating, sort: filters.sort },
        { emitEvent: false },
      );
    });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const value = this.form.getRawValue();
      this.filtersChange.emit({
        genre: value.genre,
        minRating: value.minRating,
        sort: value.sort,
      });
    });
  }
}
