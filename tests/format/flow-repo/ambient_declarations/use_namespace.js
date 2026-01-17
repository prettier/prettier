// @flow
// Test that MyNamespace implicit ambient declarations work

import {MyNamespace} from './namespace';

// Test direct access to namespace members
const x: number = MyNamespace.value; // OK - value is number
const y: string = MyNamespace.mutableValue; // OK - mutableValue is string

// Test function that uses the implicit declarations
const result: number = MyNamespace.helper("test"); // OK - helper returns number

// Test class
const instance = new MyNamespace.Helper(); // OK
instance.method(); // OK

// Test type aliases
const str: MyNamespace.MyType = "hello"; // OK - MyType is string
const obj: MyNamespace.MyInterface = { prop: 42 }; // OK

// These should error - wrong types
const badX: string = MyNamespace.value; // Error: number is not compatible with string
const badY: number = MyNamespace.mutableValue; // Error: string is not compatible with number
const badResult: string = MyNamespace.helper("test"); // Error: number is not compatible with string
