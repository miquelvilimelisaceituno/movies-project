import { InjectionToken } from '@angular/core';
import { initializeApp, type FirebaseApp } from 'firebase/app';

import { firebaseConfig } from '../config/firebase';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP', {
  providedIn: 'root',
  factory: () => initializeApp(firebaseConfig),
});
