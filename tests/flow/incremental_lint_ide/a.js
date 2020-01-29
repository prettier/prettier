// @flow

/* This is a regression test to ensure that rechecks do not crash when a
 * location involved in a lint is in a file that is not part of the recheck set.
 *
 * In this case, we have a dependency graph A -> B, so when we recheck B, A does
 * not need to also be rechecked.
 *
 * The type here is carefully constructed to ensure the position of ?string
 * points here, and is not repositioned into B. */
export type Fn = (cb: ?string => void) => void;
