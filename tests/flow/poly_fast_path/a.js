// @flow

const bar = require('./b.js');

// Checked naively, we will compute two different types for Bar in the
// merge and check phases of Flow, and so will not hit the polyt -> polyt fast
// path when checking. This regression test ensures that whatever scheme we
// use to assign ids to polymorphic types assigns Bar the same id in both
// merge and check, rather than computing a new one unnecessarily each time.

export type Bar= <T>(x: T) => T;

(bar: Bar);
