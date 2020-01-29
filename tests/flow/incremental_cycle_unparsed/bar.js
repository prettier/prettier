// @flow

import type {foo} from './foo';

function err(foo: foo): number {
  return foo.y;
}

export type bar = {
  x: string;
  foo: foo
}
