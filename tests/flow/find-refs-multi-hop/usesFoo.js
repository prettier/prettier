// @flow

import type {Foo} from './foo';

function takesFoo(x: Foo): void {
  x.prop;
}
