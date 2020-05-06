// @flow

import type { T } from './import-type4';

export type O = { // mutually recursive object type
  x: string;
  y: T;
}
