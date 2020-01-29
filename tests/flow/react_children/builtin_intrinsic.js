// @flow

import React from 'react';

// OK: Builtin intrinsics do not need any children.
<builtin />;

// OK: The builtin intrinsics allow any children.
<builtin>
  {}
  {undefined}
  {null}
  {true}
  {false}
  {0}
  {42}
  {'hello world'}
  foobar
  <buz />
  {[undefined, null, true, false, 0, 42, 'hello world', 'foobar', <buz />]}
</builtin>;

// Error: Arbitrary objects are not allowed as children for builtin intrinsics.
<builtin>
  {{a: 1, b: 2, c: 3}}
</builtin>;
