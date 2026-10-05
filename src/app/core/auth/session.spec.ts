import { TestBed } from '@angular/core/testing';
import type { Auth, NextOrObserver, User, UserCredential } from 'firebase/auth';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { AuthError } from './auth-error';
import { FIREBASE_AUTH, FIREBASE_AUTH_API, type FirebaseAuthApi } from './firebase-auth';
import { Session } from './session';

const fakeUser = {
  uid: 'u1',
  email: 'tonyina@movies.dev',
  displayName: 'tonyina',
  photoURL: null,
  getIdToken: vi.fn().mockResolvedValue('jwt-token'),
} as unknown as User;

describe('Session', () => {
  let session: Session;
  let fakeAuth: { currentUser: User | null; authStateReady: () => Promise<void> };
  let api: Record<keyof FirebaseAuthApi, Mock>;
  let emitUser: (user: User | null) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    fakeAuth = { currentUser: null, authStateReady: vi.fn().mockResolvedValue(undefined) };
    api = {
      onAuthStateChanged: vi.fn((_auth: Auth, next: NextOrObserver<User | null>) => {
        emitUser = next as (user: User | null) => void;
        return vi.fn();
      }),
      createUserWithEmailAndPassword: vi.fn(),
      signInWithEmailAndPassword: vi.fn(),
      signInWithPopup: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
      createGoogleProvider: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: FIREBASE_AUTH, useValue: fakeAuth },
        { provide: FIREBASE_AUTH_API, useValue: api },
      ],
    });
    session = TestBed.inject(Session);
  });

  it('starts as undefined while Firebase restores the session', () => {
    expect(session.user()).toBeUndefined();
    expect(session.isLoggedIn()).toBe(false);
  });

  it('exposes the user when Firebase reports a sign-in', () => {
    emitUser(fakeUser);
    expect(session.user()).toEqual({
      uid: 'u1',
      email: 'tonyina@movies.dev',
      displayName: 'tonyina',
      photoUrl: null,
    });
    expect(session.isLoggedIn()).toBe(true);
  });

  it('becomes null when Firebase reports a sign-out', () => {
    emitUser(fakeUser);
    emitUser(null);
    expect(session.user()).toBeNull();
    expect(session.isLoggedIn()).toBe(false);
  });

  it('logs in with email and password', async () => {
    api.signInWithEmailAndPassword.mockResolvedValue({} as UserCredential);
    await session.login('tonyina@movies.dev', 'secret1');
    expect(api.signInWithEmailAndPassword).toHaveBeenCalledWith(fakeAuth, 'tonyina@movies.dev', 'secret1');
  });

  it('throws an AuthError with the i18n key when login fails', async () => {
    api.signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' });
    await expect(session.login('tonyina@movies.dev', 'bad')).rejects.toEqual(
      new AuthError('invalidCredentials'),
    );
  });

  it('signs in with a Google popup', async () => {
    const provider = {};
    api.createGoogleProvider.mockReturnValue(provider);

    await session.loginWithGoogle();

    expect(api.signInWithPopup).toHaveBeenCalledWith(fakeAuth, provider);
  });

  it('saves the display name when registering', async () => {
    api.createUserWithEmailAndPassword.mockResolvedValue({ user: fakeUser } as UserCredential);
    await session.register('tonyina@movies.dev', 'secret1', 'tonyina');
    expect(api.updateProfile).toHaveBeenCalledWith(fakeUser, { displayName: 'tonyina' });
    expect(session.user()?.displayName).toBe('tonyina');
  });

  it('logs out', async () => {
    await session.logout();
    expect(api.signOut).toHaveBeenCalledWith(fakeAuth);
  });

  it('returns null as ID token without a session', async () => {
    expect(await session.getIdToken()).toBeNull();
  });

  it('returns the ID token of the current user', async () => {
    fakeAuth.currentUser = fakeUser;
    expect(await session.getIdToken()).toBe('jwt-token');
  });

  it('waits for Firebase to be ready', async () => {
    await session.ready();
    expect(fakeAuth.authStateReady).toHaveBeenCalled();
  });
});