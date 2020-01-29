// @flow

import type {Baz} from './baz';

function takesBaz(x: Baz): void {
  x.prop;
}
