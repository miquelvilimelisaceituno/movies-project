import { inject, InjectionToken } from '@angular/core';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { FIREBASE_APP } from './firebase-app';

export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE', {
  providedIn: 'root',
  factory: () => getFirestore(inject(FIREBASE_APP)),
});
