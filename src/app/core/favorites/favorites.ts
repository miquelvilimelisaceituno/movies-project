import { effect, inject, Service, signal } from '@angular/core';

import { Session } from '../auth/session';
import { FIRESTORE, FIRESTORE_API } from '../firebase/firestore';
import type { FavoriteMovie } from './favorite-movie';

export type FavoritesStatus = 'loading' | 'ready' | 'error';

@Service()
export class Favorites {
  private readonly db = inject(FIRESTORE);
  private readonly firestore = inject(FIRESTORE_API);
  private readonly session = inject(Session);

  private readonly list = signal<FavoriteMovie[]>([]);
  private readonly loadStatus = signal<FavoritesStatus>('loading');

  readonly favorites = this.list.asReadonly();
  readonly status = this.loadStatus.asReadonly();

  constructor() {
    effect((onCleanup) => {
      const user = this.session.user();
      this.list.set([]);
      this.loadStatus.set(user === null ? 'ready' : 'loading');
      if (!user) {
        return;
      }

      const favoritesQuery = this.firestore.query(
        this.firestore.collection(this.db, 'users', user.uid, 'favorites'),
        this.firestore.orderBy('addedAt', 'desc'),
      );
      const unsubscribe = this.firestore.onSnapshot(
        favoritesQuery,
        (snapshot) => {
          this.list.set(snapshot.docs.map((document) => document.data() as FavoriteMovie));
          this.loadStatus.set('ready');
        },
        () => this.loadStatus.set('error'),
      );
      onCleanup(unsubscribe);
    });
  }

  isFavorite(tmdbId: number): boolean {
    return this.list().some((movie) => movie.tmdbId === tmdbId);
  }

  async toggleFavorite(movie: FavoriteMovie): Promise<void> {
    const user = this.session.user();
    if (!user) {
      throw new Error('A session is required to change favorites');
    }

    const ref = this.firestore.doc(this.db, 'users', user.uid, 'favorites', String(movie.tmdbId));
    if (this.isFavorite(movie.tmdbId)) {
      await this.firestore.deleteDoc(ref);
    } else {
      await this.firestore.setDoc(ref, { ...movie, addedAt: this.firestore.serverTimestamp() });
    }
  }
}
