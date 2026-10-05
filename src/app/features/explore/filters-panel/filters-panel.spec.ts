import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExploreFilters } from '../explore-params';
import { FiltersPanel } from './filters-panel';

const noFilters: ExploreFilters = { genre: null, minRating: null, sort: 'popularity.desc' };

describe('FiltersPanel', () => {
  let fixture: ComponentFixture<FiltersPanel>;
  let element: HTMLElement;
  let changes: ExploreFilters[];

  const select = (id: string) => element.querySelector<HTMLSelectElement>(`#${id}`)!;

  beforeEach(async () => {
    fixture = TestBed.createComponent(FiltersPanel);
    fixture.componentRef.setInput('genres', [
      { id: 878, name: 'Ciencia ficción' },
      { id: 35, name: 'Comedia' },
    ]);
    fixture.componentRef.setInput('filters', noFilters);
    changes = [];
    fixture.componentInstance.filtersChange.subscribe((filters) => changes.push(filters));
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('lists the genres after the «all genres» option', () => {
    const options = Array.from(select('filter-genre').options).map((option) => option.text);
    expect(options).toEqual(['Todos', 'Ciencia ficción', 'Comedia']);
  });

  it('sends the new filters when the user picks an option', () => {
    select('filter-rating').selectedIndex = 3;
    select('filter-rating').dispatchEvent(new Event('change'));
    expect(changes).toEqual([{ genre: null, minRating: 7, sort: 'popularity.desc' }]);
  });

  it('shows the filters that come from the URL without sending them back', async () => {
    fixture.componentRef.setInput('filters', {
      genre: 35,
      minRating: 8,
      sort: 'primary_release_date.desc',
    });
    await fixture.whenStable();
    expect(select('filter-genre').selectedOptions[0].text).toBe('Comedia');
    expect(select('filter-rating').selectedOptions[0].text).toContain('8');
    expect(select('filter-sort').selectedOptions[0].text).toBe('Más recientes');
    expect(changes).toEqual([]);
  });

  it('asks to reset the filters', () => {
    let resets = 0;
    fixture.componentInstance.reset.subscribe(() => resets++);
    element.querySelector('button')!.click();
    expect(resets).toBe(1);
  });

  it('can be disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(element.querySelector('fieldset')?.disabled).toBe(true);
  });
});
