import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Video } from '../../../core/catalog/models/movie';
import { Videos } from './videos';

const video = (changes: Partial<Video>): Video => ({
  id: '1',
  key: 'abc123',
  name: 'Tráiler oficial',
  site: 'YouTube',
  type: 'Trailer',
  official: true,
  ...changes,
});

describe('Videos', () => {
  let fixture: ComponentFixture<Videos>;
  let element: HTMLElement;

  const render = async (videos: Video[]) => {
    fixture.componentRef.setInput('videos', videos);
    await fixture.whenStable();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Videos);
    element = fixture.nativeElement;
  });

  it('links to the first YouTube trailer', async () => {
    await render([
      video({ key: 'teaser', type: 'Teaser' }),
      video({ key: 'vimeo', site: 'Vimeo' }),
      video({ key: 'trailer' }),
    ]);
    const link = element.querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://www.youtube.com/watch?v=trailer');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.textContent).toContain('se abre en una pestaña nueva');
  });

  it('shows a message when there is no trailer', async () => {
    await render([video({ type: 'Teaser' })]);
    expect(element.querySelector('a')).toBeNull();
    expect(element.textContent).toContain('Tráiler no disponible');
  });
});
