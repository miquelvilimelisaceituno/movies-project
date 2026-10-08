import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePage } from './profile-page';
import type { AppUser } from '../../../core/auth/app-user';
import { Session } from '../../../core/auth/session';

const TONYINA: AppUser = {
  uid: '1',
  email: 'tonyina@test.com',
  displayName: 'Tonyina',
  photoUrl: 'https://example.com/tonyina.png',
};

describe('ProfilePage', () => {
  let user:  ReturnType<typeof signal<AppUser | null | undefined>>;;
  let fixture: ComponentFixture<ProfilePage>;

  beforeEach(() => {
    user = signal<AppUser | null | undefined>(TONYINA);
    TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [{ provide: Session, useValue: { user } }],
    });

    fixture = TestBed.createComponent(ProfilePage);
  });

  function render(): HTMLElement {
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the user name and email', () => {
    const text = render().textContent;

    expect(text).toContain('Tonyina');
    expect(text).toContain('tonyina@test.com');
  });

  it('shows a placeholder when the user has no name', () => {
    user.set({ ...TONYINA, displayName: null });

    expect(render().textContent).toContain('Sin nombre');
  });

  it('shows the photo when there is one', () => {
    const img = render().querySelector('img');

    expect(img?.getAttribute('src')).toBe(TONYINA.photoUrl);
  });

  it('shows no photo when there is none', () => {
    user.set({ ...TONYINA, photoUrl: null });

    expect(render().querySelector('img')).toBeNull();
  });
});
