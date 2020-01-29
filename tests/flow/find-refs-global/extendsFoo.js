// @flow

import {Foo} from './es6-1';

class Bar extends Foo {
  // overrides Foo's bar
  bar(): void { }
}

const x = new Bar();
x.foo();
x.bar();
