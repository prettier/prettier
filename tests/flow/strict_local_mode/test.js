// @flow strict-local

import type { T } from './import'; // Error: untyped-type-import
import type { S } from './nonstrict_import'; // No error

(0: T);

function f(x) {
  x = 1; // Error: cannot reassign constant parameter
}

const x: any = {}; // Error: unclear-type
