// @flow

import type {Foo} from './es6-1';

export function takesFoo(x: Foo) {
  x.foo();
}
