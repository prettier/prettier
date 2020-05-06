// @flow strict

import type { T } from './import'; // Error: untyped-type-import
import type { S } from './nonstrict_export'; // Error: nonstrict-import

(0: T);

function f(x) {
  x = 1; // Error: cannot reassign constant parameter
}
