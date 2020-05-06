// @flow
import * as foo from "./cjs_literal_array";
module.exports = foo; // OK: re-exported CJS namespace is covariant in its properties
