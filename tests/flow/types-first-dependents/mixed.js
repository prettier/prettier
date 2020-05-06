// @flow

import type { Bar } from './types';
export type Foo = Bar;

require('./direct');

function foo(x: Foo) { }
module.exports = foo;
