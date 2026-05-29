// @flow
// Test that implicit ambient declarations in flow-typed/lib.js work correctly

const testModule = require('test-module');

// Use the functions that reference the implicitly declared variables via typeof
const x: string = testModule.getFoo(); // OK - returns string
const y: number = testModule.getBar(); // OK - returns number
const z: boolean = testModule.getBaz(); // OK - returns boolean

// These should error - wrong types
const badX: number = testModule.getFoo(); // Error: string is not compatible with number
const badY: string = testModule.getBar(); // Error: number is not compatible with string
const badZ: number = testModule.getBaz(); // Error: boolean is not compatible with number
