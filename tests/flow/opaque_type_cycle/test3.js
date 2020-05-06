//@flow

import {y} from './cycle';

export function test(x: number): typeof(y) {(x: typeof(y)); return x;}
