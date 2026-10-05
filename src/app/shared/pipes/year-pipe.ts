import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'year',
})
export class YearPipe implements PipeTransform {
  transform(date: string | null | undefined): number | null {
    const year = Number(date?.slice(0, 4));
    return year > 0 ? year : null;
  }
}
