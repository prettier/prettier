// @flow

import type { B as B1 } from './test1';
const b1 = require('./test1');

import type { B as B2 } from './test2';
const b2 = require('./test2');

(b1: B1); // Error number ~> string
(b1.x: string); // Error number ~> string
(b1.y: string); // Error, y may not exist, number ~> string
(b1.z: string); // Error, z may not exist, number ~> string

(b2: B2); // Error, number ~> string
(b2.x: string); // Error number ~> string
(b2.z: string); // Error number ~> string
