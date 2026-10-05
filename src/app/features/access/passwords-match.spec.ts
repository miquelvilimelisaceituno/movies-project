import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { PASSWORDS_MISMATCH, passwordsMatch } from './passwords-match';

describe('passwordsMatch', () => {
  /** Builds a group like the register form, with the validator applied to the group. */
  function buildForm(password: string, confirmPassword: string) {
    return new FormGroup(
      {
        password: new FormControl(password),
        confirmPassword: new FormControl(confirmPassword),
      },
      { validators: passwordsMatch('password', 'confirmPassword') },
    );
  }

  it('returns null when both passwords match', () => {
    const form = buildForm('secret123', 'secret123');

    expect(form.errors).toBeNull();
  });

  it('flags a mismatch when passwords differ', () => {
    const form = buildForm('secret123', 'other456');

    expect(form.errors).toEqual({ [PASSWORDS_MISMATCH]: true });
  });

  it('returns null while the confirmation is empty', () => {
    // An empty field is the job of Validators.required, not of this validator.
    const form = buildForm('secret123', '');

    expect(form.errors).toBeNull();
  });

  it('re-validates when a password changes', () => {
    const form = buildForm('secret123', 'secret123');

    form.controls.password.setValue('changed999');

    expect(form.errors).toEqual({ [PASSWORDS_MISMATCH]: true });
  });
});
