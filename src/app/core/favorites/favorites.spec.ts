import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import type { AppUser } from '../auth/app-user';
import { Session } from '../auth/session';
import { FIRESTORE, FIRESTORE_API, type FirestoreApi } from '../firebase/firestore';
import type { FavoriteMovie } from './favorite-movie';
import { Favorites } from './favorites';

const ana: AppUser = { uid: 'u1', email: 'ana@movies.dev', displayName: 'Ana', photoUrl: null };
const bea: AppUser = { uid: 'u2', email: 'bea@movies.dev', displayName: 'Bea', photoUrl: null };

const arrival: FavoriteMovie = {
  tmdbId: 329865,
  title: 'La llegada',
  posterPath: '/arrival.jpg',
  releaseDate: '2016-11-10',
};
const dune: FavoriteMovie = {
  tmdbId: 438631,
  title: 'Dune',
  posterPath: null,
  releaseDate: '2021-09-15',
};

interface Listener {
  query: unknown;
  next: (snapshot: { docs: { data: () => object }[] }) => void;
  error: (error: unknown) => void;
  unsubscribe: Mock;
}

describe('Favorites', () => {
  let favorites: Favorites;
  let user: ReturnType<typeof signal<AppUser | null | undefined>>;
  let api: Record<keyof FirestoreApi, Mock>;
  let listeners: Listener[];

  const signIn = (account: AppUser | null) => {
    user.set(account);
    TestBed.tick();
  };
  const emit = (movies: FavoriteMovie[]) =>
    listeners.at(-1)!.next({
      docs: movies.map((movie) => ({ data: () => ({ ...movie, addedAt: 'server-time' }) })),
    });

  beforeEach(() => {
    user = signal<AppUser | null | undefined>(undefined);
    listeners = [];
    api = {
      collection: vi.fn((_db: unknown, ...path: string[]) => ({ path: path.join('/') })),
      doc: vi.fn((_db: unknown, ...path: string[]) => ({ path: path.join('/') })),
      orderBy: vi.fn((field: string, direction: string) => ({ field, direction })),
      query: vi.fn((ref: unknown, constraint: unknown) => ({ ref, constraint })),
      onSnapshot: vi.fn((query: unknown, next: Listener['next'], error: Listener['error']) => {
        const unsubscribe = vi.fn();
        listeners.push({ query, next, error, unsubscribe });
        return unsubscribe;
      }),
      setDoc: vi.fn().mockResolvedValue(undefined),
      deleteDoc: vi.fn().mockResolvedValue(undefined),
      serverTimestamp: vi.fn(() => 'server-time'),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: FIRESTORE, useValue: {} },
        { provide: FIRESTORE_API, useValue: api },
        { provide: Session, useValue: { user } },
      ],
    });
    favorites = TestBed.inject(Favorites);
  });

  it('is loading while Firebase restores the session', () => {
    TestBed.tick();
    expect(favorites.status()).toBe('loading');
    expect(api.onSnapshot).not.toHaveBeenCalled();
  });

  it('has no favorites and does not query Firestore without a session', () => {
    signIn(null);
    expect(favorites.status()).toBe('ready');
    expect(favorites.favorites()).toEqual([]);
    expect(api.onSnapshot).not.toHaveBeenCalled();
  });

  it('listens to the favorites of the signed-in user, newest first', () => {
    signIn(ana);
    expect(listeners).toHaveLength(1);
    expect(listeners[0].query).toEqual({
      ref: { path: 'users/u1/favorites' },
      constraint: { field: 'addedAt', direction: 'desc' },
    });
    expect(favorites.status()).toBe('loading');
  });

  it('exposes the favorites received from Firestore', () => {
    signIn(ana);
    emit([arrival, dune]);
    expect(favorites.status()).toBe('ready');
    expect(favorites.favorites()).toMatchObject([arrival, dune]);
    expect(favorites.isFavorite(arrival.tmdbId)).toBe(true);
    expect(favorites.isFavorite(27205)).toBe(false);
  });

  it('distinguishes an empty list from a list still loading', () => {
    signIn(ana);
    emit([]);
    expect(favorites.status()).toBe('ready');
    expect(favorites.favorites()).toEqual([]);
  });

  it('reports an error when Firestore cannot be read', () => {
    signIn(ana);
    listeners[0].error(new Error('permission-denied'));
    expect(favorites.status()).toBe('error');
  });

  it('stops listening and empties the list on sign-out', () => {
    signIn(ana);
    emit([arrival]);
    signIn(null);
    expect(listeners[0].unsubscribe).toHaveBeenCalled();
    expect(favorites.favorites()).toEqual([]);
    expect(favorites.isFavorite(arrival.tmdbId)).toBe(false);
  });

  it('switches to the favorites of the new account', () => {
    signIn(ana);
    emit([arrival]);
    signIn(bea);
    expect(listeners[0].unsubscribe).toHaveBeenCalled();
    expect(listeners[1].query).toMatchObject({ ref: { path: 'users/u2/favorites' } });
    expect(favorites.favorites()).toEqual([]);
    expect(favorites.status()).toBe('loading');
  });

  it('adds a movie that is not a favorite yet', async () => {
    signIn(ana);
    emit([]);
    await favorites.toggleFavorite(arrival);
    expect(api.setDoc).toHaveBeenCalledWith(
      { path: 'users/u1/favorites/329865' },
      { ...arrival, addedAt: 'server-time' },
    );
    expect(api.deleteDoc).not.toHaveBeenCalled();
  });

  it('removes a movie that is already a favorite', async () => {
    signIn(ana);
    emit([arrival]);
    await favorites.toggleFavorite(arrival);
    expect(api.deleteDoc).toHaveBeenCalledWith({ path: 'users/u1/favorites/329865' });
    expect(api.setDoc).not.toHaveBeenCalled();
  });

  it('rejects when Firestore does not save the change', async () => {
    signIn(ana);
    emit([]);
    api.setDoc.mockRejectedValue(new Error('permission-denied'));
    await expect(favorites.toggleFavorite(arrival)).rejects.toThrow('permission-denied');
  });

  it('rejects without writing when there is no session', async () => {
    signIn(null);
    await expect(favorites.toggleFavorite(arrival)).rejects.toThrow();
    expect(api.setDoc).not.toHaveBeenCalled();
    expect(api.deleteDoc).not.toHaveBeenCalled();
  });
});
