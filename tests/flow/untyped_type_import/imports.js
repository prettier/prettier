/* @flow */

/* Named Imports from Untyped File */

import type {FooType} from './untyped_exports.js'; //Error
import typeof {FooObj} from './untyped_exports.js'; //Error

/* Default Imports from Untyped File */

import typeof BarObj from './untyped_exports.js'; //Error

/* Named Imports from Untyped File (That Just Don't Exist) */

import type {BazType} from './untyped_exports.js'; //Error
import typeof {BazObj} from './untyped_exports.js'; //Error

/* ``Any`` Imports from Typed File */
import type {AnyType} from './typed_exports.js' //Not an error
import typeof {AnyObj} from './typed_exports.js' //Not an error
import typeof AnyObjDefault from './typed_exports.js' //Not an error

/* Imports from Nonexistent File */
//Only `required module not found` shown.
import type {BeepType} from './nonexistent.js';
import typeof {BeepObj} from './nonexistent.js';

import typeof BoopObj from './nonexistent.js';

/* Suppressed Imports */
/* flowlint untyped-type-import:off */

import type {WhizType} from './untyped_exports.js'; //Error; Suppressed
import typeof {WhizObj} from './untyped_exports.js'; //Error; Suppressed

import typeof BangObj from './untyped_exports.js'; //Error; Suppressed
