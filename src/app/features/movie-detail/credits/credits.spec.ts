import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CastMember, CrewMember } from '../../../core/catalog/models/movie';
import { Credits } from './credits';

const actor = (id: number): CastMember => ({
  id,
  name: `Actor ${id}`,
  profile_path: null,
  known_for_department: 'Acting',
  character: `Personaje ${id}`,
  order: id,
  credit_id: `cast-${id}`,
});

const scott: CrewMember = {
  id: 578,
  name: 'Ridley Scott',
  profile_path: null,
  known_for_department: 'Directing',
  department: 'Directing',
  job: 'Director',
  credit_id: 'crew-1',
};

describe('Credits', () => {
  let fixture: ComponentFixture<Credits>;
  let element: HTMLElement;

  const render = async (cast: CastMember[], crew: CrewMember[]) => {
    fixture.componentRef.setInput('cast', cast);
    fixture.componentRef.setInput('crew', crew);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Credits], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(Credits);
    element = fixture.nativeElement;
  });

  it('shows only the directors of the crew, linked to their page', async () => {
    const writer = { ...scott, id: 1, name: 'Dan O’Bannon', job: 'Screenplay', credit_id: 'c2' };
    await render([], [scott, writer]);
    expect(element.textContent).toContain('Ridley Scott');
    expect(element.textContent).not.toContain('Dan O’Bannon');
    expect(element.querySelector('a[href="/personas/578"]')).not.toBeNull();
  });

  it('shows the first 10 actors with their character', async () => {
    const cast = Array.from({ length: 12 }, (_, index) => actor(index + 1));
    await render(cast, []);
    const actors = element.querySelectorAll('[aria-labelledby="cast-title"] li');
    expect(actors.length).toBe(10);
    expect(actors[0].textContent).toContain('Actor 1');
    expect(actors[0].textContent).toContain('Personaje 1');
    expect(actors[0].querySelector('a')?.getAttribute('href')).toBe('/personas/1');
  });

  it('shows the photo, or a placeholder when it is missing', async () => {
    await render([{ ...actor(1), profile_path: '/foto.jpg' }, actor(2)], []);
    expect(element.querySelector('img')?.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w185/foto.jpg',
    );
    expect(element.textContent).toContain('Foto no disponible');
  });

  it('shows messages when there is no cast or director', async () => {
    await render([], []);
    expect(element.textContent).toContain('Reparto no disponible');
    expect(element.textContent).toContain('Dirección no disponible');
  });
});
