import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MovieSummary, PersonDetails } from '../../../core/catalog/models/movie';
import { PersonPage } from './person-page';

const movie = (id: number, title: string, release_date: string): MovieSummary => ({
  id,
  title,
  original_title: title,
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date,
  vote_average: 7,
  vote_count: 100,
  genre_ids: [],
});

const scott: PersonDetails = {
  id: 578,
  name: 'Ridley Scott',
  profile_path: '/scott.jpg',
  known_for_department: 'Directing',
  biography: 'Director británico.',
  birthday: '1937-11-30',
  deathday: null,
  place_of_birth: 'South Shields, Inglaterra',
  movie_credits: {
    cast: [{ ...movie(1, 'Cameo', '2010-01-01'), character: 'Él mismo', credit_id: 'c1' }],
    crew: [
      {
        ...movie(348, 'Alien', '1979-05-25'),
        job: 'Director',
        department: 'Directing',
        credit_id: 'd1',
      },
      {
        ...movie(98, 'Gladiator', '2000-05-01'),
        job: 'Director',
        department: 'Directing',
        credit_id: 'd2',
      },
      {
        ...movie(98, 'Gladiator', '2000-05-01'),
        job: 'Producer',
        department: 'Production',
        credit_id: 'p1',
      },
    ],
  },
};

describe('PersonPage', () => {
  let fixture: ComponentFixture<PersonPage>;
  let http: HttpTestingController;
  let element: HTMLElement;

  const openUrlWithId = (id: string) => {
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
  };

  const titlesIn = (sectionId: string) =>
    Array.from(element.querySelectorAll(`section[aria-labelledby="${sectionId}"] h3`), (title) =>
      title.textContent?.trim(),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PersonPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PersonPage);
    element = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  it('requests the person of the URL and shows a loading message', () => {
    openUrlWithId('578');
    http.expectOne('/api/tmdb/person/578');
    fixture.detectChanges();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Cargando persona');
  });

  it('shows the person details', async () => {
    openUrlWithId('578');
    http.expectOne('/api/tmdb/person/578').flush(scott);
    await fixture.whenStable();

    expect(element.querySelector('h1')?.textContent).toContain('Ridley Scott');
    expect(element.textContent).toContain('30/11/1937');
    expect(element.textContent).toContain('South Shields, Inglaterra');
    expect(element.textContent).toContain('Director británico.');
    expect(element.textContent).not.toContain('Fecha de fallecimiento');
    expect(element.querySelector('img.photo')?.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w342/scott.jpg',
    );
  });

  it('shows acting and directing movies, newest first, without other jobs', async () => {
    openUrlWithId('578');
    http.expectOne('/api/tmdb/person/578').flush(scott);
    await fixture.whenStable();

    expect(titlesIn('acting-title')).toEqual(['Cameo']);
    expect(titlesIn('directing-title')).toEqual(['Gladiator', 'Alien']);
    expect(element.querySelector('a[href="/peliculas/348"]')).not.toBeNull();
  });

  it('shows "no disponible" when TMDB has no data', async () => {
    openUrlWithId('578');
    http.expectOne('/api/tmdb/person/578').flush({
      ...scott,
      profile_path: null,
      biography: '',
      birthday: null,
      place_of_birth: null,
      movie_credits: { cast: [], crew: [] },
    });
    await fixture.whenStable();

    expect(element.querySelector('img.photo')).toBeNull();
    expect(element.textContent).toContain('Foto no disponible');
    expect(element.textContent).toContain('No disponible');
    expect(element.textContent).toContain('Filmografía no disponible');
    expect(element.querySelector('#acting-title')).toBeNull();
    expect(element.querySelector('#directing-title')).toBeNull();
  });

  it('shows the death date when the person has died', async () => {
    openUrlWithId('578');
    http.expectOne('/api/tmdb/person/578').flush({ ...scott, deathday: '2020-02-03' });
    await fixture.whenStable();

    expect(element.textContent).toContain('Fecha de fallecimiento');
    expect(element.textContent).toContain('03/02/2020');
  });

  it('shows a message and makes no request when the ID is not valid', () => {
    for (const id of ['abc', '0', '-5', '1.5']) {
      openUrlWithId(id);
      http.expectNone(() => true);
      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'La dirección no corresponde a ninguna persona.',
      );
    }
  });

  it('shows an error and retries the request', async () => {
    openUrlWithId('578');
    http
      .expectOne('/api/tmdb/person/578')
      .flush({ error: { message: 'TMDB no responde.' } }, { status: 504, statusText: 'Timeout' });
    await fixture.whenStable();
    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('No se ha podido cargar la persona.');

    alert?.querySelector('button')?.click();
    fixture.detectChanges();
    http.expectOne('/api/tmdb/person/578').flush(scott);
    await fixture.whenStable();
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelector('h1')?.textContent).toContain('Ridley Scott');
  });

  it('loads the new person when the ID of the URL changes', async () => {
    openUrlWithId('578');
    http.expectOne('/api/tmdb/person/578').flush(scott);
    await fixture.whenStable();

    openUrlWithId('4587');
    http.expectOne('/api/tmdb/person/4587').flush({ ...scott, id: 4587, name: 'Sigourney Weaver' });
    await fixture.whenStable();
    expect(element.querySelector('h1')?.textContent).toContain('Sigourney Weaver');
  });
});
