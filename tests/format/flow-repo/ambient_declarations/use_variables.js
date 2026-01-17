// @flow
// Test that implicit ambient declarations in variables.js.flow work correctly

// Import the ambient variables from variables.js.flow
// These were declared as: const foo: string; let bar: number; var baz: boolean;
import { foo, bar, baz, genericVal, ambient, regular, withBoth } from './variables.js';

// Use the imported values with correct types
const x: string = foo; // OK
const y: number = bar; // OK
const z: boolean = baz; // OK
const arr: Array<string> = genericVal; // OK
const n: number = ambient; // OK
const r: number = regular; // OK - regular = 123
const w: string = withBoth; // OK - withBoth = "test"

// These should error - wrong types
const badX: number = foo; // Error: string is not compatible with number
const badY: string = bar; // Error: number is not compatible with string
const badZ: string = baz; // Error: boolean is not compatible with string
const badArr: Array<number> = genericVal; // Error: Array<string> is not compatible with Array<number>
