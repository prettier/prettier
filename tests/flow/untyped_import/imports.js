/* @flow */

/* Named Imports from Untyped File */
import {FooObj} from './untyped_exports.js'; //Error
import * as All from './untyped_exports.js'; //Error

/* Default Imports from Untyped File */
import BarObj from './untyped_exports.js'; //Error

/* Named Imports from Untyped File (That Just Don't Exist) */
import {BazObj} from './untyped_exports.js'; //Error

/* CJS Imports from Untyped File */
const BarObj2 = require("./untyped_exports"); //Error

/* ``Any`` Imports from Typed File */
import {AnyObj} from './typed_exports.js' //Not an error
import AnyObjDefault from './typed_exports.js' //Not an error

/* Imports from Nonexistent File */
//Only `required module not found` shown.
import {BeepObj} from './nonexistent.js';
import BoopObj from './nonexistent.js';

/* Suppressed Imports */
/* flowlint untyped-import:off */
import {WhizObj} from './untyped_exports.js'; //Error; Suppressed
import BangObj from './untyped_exports.js'; //Error; Suppressed
import * as All2 from './untyped_exports.js'; //Error; Suppressed
const BarObj3 = require("./untyped_exports"); //Error; Suppressed
