import { InjectionToken } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, type Auth, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged,signInWithEmailAndPassword,signInWithPopup, signOut, updateProfile } from 'firebase/auth';

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

/** The Firebase Auth functions Session uses, grouped so tests can replace them. */
const firebaseAuthApi = {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  createGoogleProvider: () => new GoogleAuthProvider(),
};

export type FirebaseAuthApi = typeof firebaseAuthApi;

/**
 * Firebase Auth functions used by Session.
 * Tests replace them with { provide: FIREBASE_AUTH_API, useValue: fakeApi }.
 */
export const FIREBASE_AUTH_API = new InjectionToken<FirebaseAuthApi>('FIREBASE_AUTH_API', {
  providedIn: 'root',
  factory: () => firebaseAuthApi,
});