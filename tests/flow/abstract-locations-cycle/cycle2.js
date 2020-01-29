// @flow

import {Foo} from './cycle1';

export const foo = new Foo();

export type Bar = Foo;
