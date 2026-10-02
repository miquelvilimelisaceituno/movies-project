import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import type { AppUser } from './app-user';
import { AuthError } from './auth-error';
import { authErrorKey } from './auth-error-key';
import { FIREBASE_AUTH } from './firebase-auth';

/**
 * Current user session, backed by Firebase Auth.
 * Public contract for the rest of the app: components never import Firebase.
 */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly auth = inject(FIREBASE_AUTH);

  /** undefined = Firebase is still restoring a previous session. */
  private readonly currentUser = signal<AppUser | null | undefined>(undefined);

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUser());

  constructor() {
    const unsubscribe = onAuthStateChanged(this.auth, (firebaseUser) =>
      this.currentUser.set(toAppUser(firebaseUser)),
    );
    inject(DestroyRef).onDestroy(unsubscribe);
  }

  /** Resolves once Firebase knows whether there is a signed-in user. */
  ready(): Promise<void> {
    return this.auth.authStateReady();
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    await this.withAuthErrors(async () => {
      const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(user, { displayName });
      // onAuthStateChanged fired before updateProfile, so refresh the name.
      this.currentUser.set(toAppUser(user));
    });
  }

  async login(email: string, password: string): Promise<void> {
    await this.withAuthErrors(() => signInWithEmailAndPassword(this.auth, email, password));
  }

  async loginWithGoogle(): Promise<void> {
    await this.withAuthErrors(() => signInWithPopup(this.auth, new GoogleAuthProvider()));
  }

  async logout(): Promise<void> {
    await this.withAuthErrors(() => signOut(this.auth));
  }

  /** Firebase ID token (JWT) for our backend, or null without a session. */
  async getIdToken(): Promise<string | null> {
    const firebaseUser = this.auth.currentUser;
    return firebaseUser ? firebaseUser.getIdToken() : null;
  }

  private async withAuthErrors(action: () => Promise<unknown>): Promise<void> {
    try {
      await action();
    } catch (error) {
      throw new AuthError(authErrorKey(error));
    }
  }
}

function toAppUser(firebaseUser: User | null): AppUser | null {
  if (!firebaseUser) {
    return null;
  }
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoUrl: firebaseUser.photoURL,
  };
}