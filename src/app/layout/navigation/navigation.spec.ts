import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Session } from '../../core/auth/session';
import { Navigation } from './navigation';

@Component({ template: '' })
class EmptyPage {}

describe('Navigation', () => {
  let fixture: ComponentFixture<Navigation>;
  let element: HTMLElement;

  const goTo = async (url: string) => {
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
  };

  const link = (text: string) =>
    Array.from(element.querySelectorAll('nav a')).find((anchor) =>
      anchor.textContent?.includes(text),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Navigation],
      providers: [
        provideRouter([
          { path: '', component: EmptyPage },
          { path: 'explorar', component: EmptyPage },
        ]),
        { provide: Session, useValue: { user: signal(null) } },
      ],
    });
    fixture = TestBed.createComponent(Navigation);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('shows a labelled navigation with links to home and explore', () => {
    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe('Principal');
    expect(link('Inicio')?.getAttribute('href')).toBe('/');
    expect(link('Explorar')?.getAttribute('href')).toBe('/explorar');
  });

  it('marks only the home link as the current page at the root URL', async () => {
    await goTo('/');

    expect(link('Inicio')?.getAttribute('aria-current')).toBe('page');
    expect(link('Explorar')?.hasAttribute('aria-current')).toBe(false);
  });

  it('marks only the explore link as the current page in explore', async () => {
    await goTo('/explorar?q=alien');

    expect(link('Explorar')?.getAttribute('aria-current')).toBe('page');
    expect(link('Inicio')?.hasAttribute('aria-current')).toBe(false);
  });

  it('includes the user menu', () => {
    expect(element.querySelector('header app-user-menu')).not.toBeNull();
  });
});
