// @flow

import {o} from "./cycle1";

if (o.q) {} // error: o.q does not exist

export var o_loop = o;
