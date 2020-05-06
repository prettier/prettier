// @flow

import type { C } from './exports-class';
import type { P } from './exports-poly-class';
import type { C as LocalC } from './exports-class';
import type { P as LocalP } from './exports-poly-class';

declare var c: C;
declare var p: P<number>;
declare var lc: LocalC;
declare var lp: LocalP<number>;
