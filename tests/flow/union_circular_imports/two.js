/* @flow */
import type { One } from './one';
export type Two = string | One;
const x: Two = false;
