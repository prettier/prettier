/* This small regression test ensures that const refinement does not
 * unintentionally transition undeclared consts into the initialized state.
 * Specifically, accessing `c` in the consequent of the conditional should be a
 * TDZ error. */

function f() {
  if (c != null) { // error: declaration comes later
    c; // error: declaration comes later
  }
  const c: ?number = 0;
}

/* Note that it's legal to access a const in a different activation, since const
 * initialization is temporal, not lexical. (hence the T in TDZ) */
function g() {
  function h() {
    if (c != null) { // ok: different activation
      c; // ok: different activation
    }
  }
  const c: ?number = 0;
}
