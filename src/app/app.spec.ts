import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { signal } from '@angular/core';
import { Session } from './core/auth/session';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting(), { provide: Session, useValue: { user: signal(null) } },],
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the home page at the root URL', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Abre los ojos...',
    );
  });

  it('shows the navigation and the page content inside main', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('app-navigation')).not.toBeNull();
    expect(element.querySelector('main router-outlet')).not.toBeNull();
  });

  it('moves the focus to the main content with the skip link', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const skipLink = element.querySelector<HTMLAnchorElement>('a.skip-link');

    expect(skipLink?.textContent).toContain('Saltar al contenido');
    skipLink?.click();
    expect(document.activeElement).toBe(element.querySelector('main'));
  });
});
