import { inject, InjectionToken } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';

import { FIREBASE_APP } from './firebase-app';

export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE', {
  providedIn: 'root',
  factory: () => getFirestore(inject(FIREBASE_APP)),
});

const firestoreApi = {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
};

export type FirestoreApi = typeof firestoreApi;

export const FIRESTORE_API = new InjectionToken<FirestoreApi>('FIRESTORE_API', {
  providedIn: 'root',
  factory: () => firestoreApi,
});
