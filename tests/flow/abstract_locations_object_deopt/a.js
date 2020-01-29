// @flow

const bar = require('./b.js');

type Foo = {};

// Checked naively, we will compute two different object types for Bar in the
// merge and check phases of Flow, and so will not hit the objT -> objT fast
// path when checking. This regression test ensures that whatever scheme we
// use to assign ids to object property maps assigns Bar the same id in both
// merge and check, rather than computing a new one unnecessarily each time. 

export type Bar = {|
  bar: () => {
    foo?: Foo => Foo,
  },
|};

(bar: Bar);
