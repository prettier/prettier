/* @flow strict */

// Named imports from non-strict file
import {FooObj} from './nonstrict_exports.js'; // Error
import * as All from './nonstrict_exports.js'; // Error

// Default imports from non-strict file
import BarObj from './nonstrict_exports.js'; // Error

// CJS imports from non-strict file
const BarObj2 = require("./nonstrict_exports"); // Error

// Imports from strict file
import {A} from './strict_exports.js'; // Not an error
import ADefault from './strict_exports.js'; // Not an error

// Imports from strict-local file
import type {V} from './strict_local_exports.js'; // Error

// Import from library
import StrictLib from './strict_lib.js'; // Not an error

import NonstrictLib from './nonstrict_lib.js'; // Error

const CommonJSModule = require('CommonJSModule'); // Not an error
import ESModule from 'ESModule'; // Not an error

// Import type
import type {N} from './strict_exports.js'; // Not an error
import type {S} from './nonstrict_exports.js'; // Error

// Import typeof
import typeof {A as AType} from './strict_exports.js'; // Not an error
import typeof {FooObj as FooObjType} from './nonstrict_exports.js'; // Error

// Suppressed imports
// flowlint nonstrict-import:off
import {BazObj} from './nonstrict_exports.js'; // Error; Suppressed
import BangObj from './nonstrict_exports.js'; // Error; Suppressed
import * as All2 from './nonstrict_exports.js'; // Error; Suppressed
const BarObj3 = require("./nonstrict_exports"); // Error; Suppressed
