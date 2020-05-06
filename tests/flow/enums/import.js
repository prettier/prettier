// @flow

import {B} from './export-commonjs.js';
import C from './export-commonjs-default.js';
import D, {E, F} from './export.js';

const {B: B2} = require('./export-commonjs.js');
const C2 = require('./export-commonjs-default.js');
const {default: D2} = require('./export.js');
const {E: E2, F: F2} = require('./export.js');

const b: B = B.A;
const c: C = C.A;
const d: D = D.A;
const e: E = E.A;
const f: F = F.A;

const b2: B2 = B2.A;
const c2: C2 = C2.A;
const d2: D2 = D2.A;
const e2: E2 = E2.A;
const f2: F2 = F2.A;
