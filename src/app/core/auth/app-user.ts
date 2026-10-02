/**
 * Authenticated user as the app sees it.
 * Decouples components from Firebase's User type.
 */
export interface AppUser {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly photoUrl: string | null;
}
// readonly beacause no one should modify the user from otside the service
// null because some users may not have all the values

