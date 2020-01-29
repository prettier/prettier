// @flow

import type { O } from './import-type5';

export type T = { // mutually recursive object type
  x: string;
  y: O;
}
