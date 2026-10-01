import { InjectionToken } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

import { firebaseConfig } from '../config/firebase';

/**
 * Firebase Auth instance shared by the whole app.
 * The factory runs only once, the first time the token is injected,
 * so Firebase is initialized lazily and never twice.
 * Tests replace it with { provide: FIREBASE_AUTH, useValue: fakeAuth }.
 */
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH', {
  providedIn: 'root',
  factory: () => getAuth(initializeApp(firebaseConfig)),
});