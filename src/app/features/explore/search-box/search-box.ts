import { Component, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import { TEXTS } from '../../../core/config/texts';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-search-box',
  styleUrl: './search-box.css',
  templateUrl: './search-box.html',
})
export class SearchBox {
  readonly query = input('');

  readonly queryChange = output<string>();

  protected readonly texts = TEXTS.searchBox;

  protected readonly control = new FormControl('', { nonNullable: true });

  private lastSent = '';

  constructor() {
    effect(() => {
      const query = this.query();
      if (query !== this.lastSent) {
        this.lastSent = query;
        this.control.setValue(query, { emitEvent: false });
      }
    });

    this.control.valueChanges
      .pipe(
        debounceTime(400),
        map((text) => text.trim()),
        takeUntilDestroyed(),
      )
      .subscribe((text) => this.send(text));
  }

  protected submit(event: Event) {
    event.preventDefault();
    this.send(this.control.value.trim());
  }

  private send(text: string) {
    if (text === this.lastSent) {
      return;
    }
    this.lastSent = text;
    this.queryChange.emit(text);
  }
}
