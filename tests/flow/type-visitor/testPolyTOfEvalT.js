//@flow

import type {Config} from './exp.js';
declare function f<T>(): Config<T>;
module.exports = f(); // should pass.
