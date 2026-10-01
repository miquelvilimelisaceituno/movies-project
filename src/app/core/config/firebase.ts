import type { FirebaseOptions } from 'firebase/app';

/**
 * Public Firebase web configuration.
 * It only identifies the project, so it is safe to commit:
 * security relies on Firebase authorized domains and on
 * ID token verification in the backend.
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyC5_6cAMgI4AHm8HhH2qfWPTbs1F-KtbUk',
  authDomain: 'movies-tmdb-7a1cf.firebaseapp.com',
  projectId: 'movies-tmdb-7a1cf',
  storageBucket: 'movies-tmdb-7a1cf.firebasestorage.app',
  messagingSenderId: '485493990443',
  appId: '1:485493990443:web:a943d8114d3edabcbff66e',
};
