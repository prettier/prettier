/**
 * @flow strict
 */

import type {N} from './cycle_a.js'; // Error

export type S = string;

const xs: Array<N> = [1, 2, 3];

module.exports = xs;
