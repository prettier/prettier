// @flow

import type {Bar} from './bar';

function takesBar(x: Bar): void {
  x.prop;
}

const z: Bar = {prop: ''};
