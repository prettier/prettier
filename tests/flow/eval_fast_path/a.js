// @flow

const bar = require('./b.js');

// Checked naively, we will compute two different types for Bar in the
// merge and check phases of Flow, and so will not hit the evalt -> evalt fast
// path when checking. This regression test ensures that whatever scheme we
// use to assign ids to evaluated types assigns Bar the same id in both
// merge and check, rather than computing a new one unnecessarily each time.

export type Bar = $PropertyType<{p:string}, 'p'> => void;

(bar: Bar);
