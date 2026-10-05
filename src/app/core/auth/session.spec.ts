import { TestBed } from '@angular/core/testing';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
  type NextOrObserver,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthError } from './auth-error';
import { FIREBASE_AUTH } from './firebase-auth';
import { Session} from './session'

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

const fakeUser = {
  uid: 'u1',
  email: 'ana@movies.dev',
  displayName: 'Ana',
  photoURL: null,
  getIdToken: vi.fn().mockResolvedValue('jwt-token'),
} as unknown as User;

describe('Session', () => {
  let session: Session;
  let fakeAuth: { currentUser: User | null; authStateReady: () => Promise<void> };
  let emitUser: (user: User | null) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    fakeAuth = { currentUser: null, authStateReady: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(onAuthStateChanged).mockImplementation(
      (_auth: Auth, next: NextOrObserver<User | null>) => {
        emitUser = next as (user: User | null) => void;
        return vi.fn();
      },
    );

    TestBed.configureTestingModule({
      providers: [{ provide: FIREBASE_AUTH, useValue: fakeAuth }],
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
      email: 'ana@movies.dev',
      displayName: 'Ana',
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
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as UserCredential);
    await session.login('ana@movies.dev', 'secret1');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(fakeAuth, 'ana@movies.dev', 'secret1');
  });

  it('throws an AuthError with the i18n key when login fails', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: 'auth/invalid-credential' });
    await expect(session.login('ana@movies.dev', 'bad')).rejects.toEqual(
      new AuthError('invalidCredentials'),
    );
  });

  it('saves the display name when registering', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: fakeUser,
    } as UserCredential);
    await session.register('ana@movies.dev', 'secret1', 'Ana');
    expect(updateProfile).toHaveBeenCalledWith(fakeUser, { displayName: 'Ana' });
    expect(session.user()?.displayName).toBe('Ana');
  });

  it('logs out', async () => {
    await session.logout();
    expect(signOut).toHaveBeenCalledWith(fakeAuth);
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