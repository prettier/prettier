/**
 * @flow
 */

var A = require('./A.js');

var good: number = A.Good.foo(); // string ~> number

var f = A.Bad.foo; // Property access is fine
var bad_: number = f(); // error: string ~> number

var bad: number = A.Bad.foo(); // error: string, number (but `this` types are compatible)
