// @flow
const e = require('basic');
const i = require('implicit_ignored');
const u = require('untyped');
const L = require('libdef');
import type { Type } from 'type';
import { f } from 'type';

module.exports.explicit_any = e.any; // error
module.exports.explicit_function = e.function; // error
module.exports.implicit_ignore = i;
module.exports.untyped = u; // error
module.exports.lib = L.v; // error
module.exports.field = f; // error
let x : Type = 3;
module.exports.x = x;
