import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoriteButton } from './favorite-button';

describe('FavoriteButton', () => {
  let fixture: ComponentFixture<FavoriteButton>;
  let button: () => HTMLButtonElement;

  const render = async (active: boolean, disabled = false) => {
    fixture.componentRef.setInput('active', active);
    fixture.componentRef.setInput('disabled', disabled);
    await fixture.whenStable();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteButton);
    button = () => fixture.nativeElement.querySelector('button');
  });

  it('shows a pressed button when the movie is a favorite', async () => {
    await render(true);
    expect(button().getAttribute('aria-pressed')).toBe('true');
    expect(button().textContent).toContain('★');
    expect(button().textContent).toContain('Favorita');
  });

  it('shows a released button when the movie is not a favorite', async () => {
    await render(false);
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(button().textContent).toContain('☆');
  });

  it('notifies a click', async () => {
    let clicks = 0;
    fixture.componentInstance.toggled.subscribe(() => clicks++);
    await render(false);
    button().click();
    expect(clicks).toBe(1);
  });

  it('can be disabled', async () => {
    await render(false, true);
    expect(button().disabled).toBe(true);
  });
});
