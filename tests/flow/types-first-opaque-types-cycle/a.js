// @flow

import type {O} from './b';
declare var x: O;
(x: number); // error O ~> number
module.exports = x;
