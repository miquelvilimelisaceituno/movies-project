import { TestBed } from '@angular/core/testing';

import { FIREBASE_AUTH } from '../auth/firebase-auth';
import { FIREBASE_APP } from './firebase-app';
import { FIRESTORE } from './firestore';

describe('Firebase tokens', () => {
  it('share a single Firebase app between Auth and Firestore', () => {
    const app = TestBed.inject(FIREBASE_APP);

    expect(TestBed.inject(FIREBASE_AUTH).app).toBe(app);
    expect(TestBed.inject(FIRESTORE).app).toBe(app);
  });
});
