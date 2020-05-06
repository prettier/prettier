/**
 * @format
 * @flow
 */

import {a1, a2, a3, a4, a5, a6} from './a';
import {b1, b2, b3, b4, b5, b6} from './b';
import c from './c';
import d from './d';
import e from './e';
import f from './f';

(a1: empty);
([a1, a2, a3, a4, a5, a6]: [empty, empty, empty, empty, empty, empty]);
([a6, a5, a4, a3, a2, a1]: [empty, empty, empty, empty, empty, empty]);
([a1, a6, a2, a5, a3, a4]: [empty, empty, empty, empty, empty, empty]);
([a6, a1, a5, a2, a4, a3]: [empty, empty, empty, empty, empty, empty]);

([a1, a5, a6, b1, b5, b6]: [empty, empty, empty, empty, empty, empty]);
([b1, b5, b6, a1, a5, a6]: [empty, empty, empty, empty, empty, empty]);
([a1, b1, a5, b5, a6, b6]: [empty, empty, empty, empty, empty, empty]);

([a1, a3, a6, b1, b3, b6]: [empty, empty, empty, empty, empty, empty]);
([b1, b3, b6, a1, a3, a6]: [empty, empty, empty, empty, empty, empty]);
([a1, b1, a3, b3, a6, b6]: [empty, empty, empty, empty, empty, empty]);

([a1, b1, c, d, e, f]: [empty, empty, empty, empty, empty, empty]);
([f, e, d, c, b1, a1]: [empty, empty, empty, empty, empty, empty]);
([a1, f, b1, e, c, d]: [empty, empty, empty, empty, empty, empty]);
([f, a1, e, b1, d, c]: [empty, empty, empty, empty, empty, empty]);
