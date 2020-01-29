// @flow

import type {bar} from './bar';

function err(bar: bar): number {
  return bar.x;
}

export type foo = {
  y: string;
  bar: bar
}
