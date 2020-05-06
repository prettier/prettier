// @flow

import type {C} from './lib';

(x: C<number> | C<string>) => {
  x.m(y => {
    (y: number); // error string ~> number
  });
}
