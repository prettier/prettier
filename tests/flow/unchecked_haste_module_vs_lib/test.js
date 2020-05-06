/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * @flow
 */

/* 'buffer' is the name of both an unchecked module in this directory,
 * and a module declared in library file node.js.
 * If the require below resolves to the unchecked module, the mistyping
 * that follows will cause no errors, but if we resolve to the library
 * instead, we'll get the desired error.
 */
var buffer = require("buffer");
var x: string = buffer.INSPECT_MAX_BYTES; // error, number ~/> string
