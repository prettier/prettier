//@flow

'use strict';

import type {Props} from './lib.js';

class Class {
  constructor(props: Props) {
    const inputProps = {
      ...props,
      foo: 'bar',
    };
  }
}

declare var x : mixed;
//$FlowFixMe should suppress
if(x) {

};
