// @flow

import typeof T from './nested_frozen_object';
declare var o: T;

(o.a: number);

module.exports = o;
