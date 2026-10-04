import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Error key set on the group when the two passwords differ. */
export const PASSWORDS_MISMATCH = 'passwordsMismatch';

/**
 * Group validator that checks that two password fields have the same value.
 * Receives the field names so it doesn't depend on how the form names them.
 */
export function passwordsMatch(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirmation = group.get(confirmKey)?.value;

    // An empty confirmation is reported by Validators.required, not here.
    if (!confirmation) {
      return null;
    }

    return password === confirmation ? null : { [PASSWORDS_MISMATCH]: true };
  };
}