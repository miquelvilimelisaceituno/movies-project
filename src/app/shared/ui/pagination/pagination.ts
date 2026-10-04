import { Component, input, output } from '@angular/core';
import { TEXTS } from '../../../core/config/texts';

@Component({
  selector: 'app-pagination',
  styleUrl: './pagination.css',
  templateUrl: './pagination.html',
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly texts = TEXTS.pagination;
}
