import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBox } from './search-box';

describe('SearchBox', () => {
  let fixture: ComponentFixture<SearchBox>;
  let input: HTMLInputElement;
  let sent: string[];

  const type = (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(SearchBox);
    sent = [];
    fixture.componentInstance.queryChange.subscribe((text) => sent.push(text));
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  afterEach(() => vi.useRealTimers());

  it('waits until the user stops typing and sends the trimmed text once', () => {
    type('A');
    vi.advanceTimersByTime(200);
    type('Ali');
    vi.advanceTimersByTime(200);
    type(' Alien ');
    expect(sent).toEqual([]);

    vi.advanceTimersByTime(400);
    expect(sent).toEqual(['Alien']);
  });

  it('does not send the same text twice', () => {
    type('Alien');
    vi.advanceTimersByTime(400);
    type('Alien ');
    vi.advanceTimersByTime(400);
    expect(sent).toEqual(['Alien']);
  });

  it('sends the text at once when the form is submitted', () => {
    type('Alien');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    expect(sent).toEqual(['Alien']);
  });

  it('shows the text that comes from the URL without sending it back', () => {
    fixture.componentRef.setInput('query', 'Amélie');
    fixture.detectChanges();
    vi.advanceTimersByTime(400);
    expect(input.value).toBe('Amélie');
    expect(sent).toEqual([]);
  });
});
