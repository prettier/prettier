// @flow

import AbstractObjectValue from './AbstractObjectValue.js';
import ObjectValue from './ObjectValue.js';
import NativeFunctionValue from './NativeFunctionValue.js';

function _() {
  NativeFunctionValue(([object]) => {
    if (object instanceof AbstractObjectValue || object instanceof ObjectValue) {
    }
  });
}
