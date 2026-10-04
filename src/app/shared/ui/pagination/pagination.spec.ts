import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';

describe('Pagination', () => {
  let fixture: ComponentFixture<Pagination>;
  let element: HTMLElement;
  let requested: number[];

  const render = async (page: number, totalPages: number) => {
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('totalPages', totalPages);
    await fixture.whenStable();
  };
  const button = (text: string) =>
    Array.from(element.querySelectorAll('button')).find((item) =>
      item.textContent?.includes(text),
    )!;

  beforeEach(() => {
    fixture = TestBed.createComponent(Pagination);
    element = fixture.nativeElement;
    requested = [];
    fixture.componentInstance.pageChange.subscribe((page) => requested.push(page));
  });

  it('is hidden when there is only one page', async () => {
    await render(1, 1);
    expect(element.querySelector('nav')).toBeNull();
  });

  it('shows the current page and asks for the previous and next ones', async () => {
    await render(2, 5);
    expect(element.textContent).toContain('Página 2 de 5');
    button('Anterior').click();
    button('Siguiente').click();
    expect(requested).toEqual([1, 3]);
  });

  it('disables the buttons at the first and last page', async () => {
    await render(1, 5);
    expect(button('Anterior').disabled).toBe(true);
    await render(5, 5);
    expect(button('Siguiente').disabled).toBe(true);
  });
});
