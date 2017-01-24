/* @flow */

var stringTest1: Iterable<string> = "hi";
var stringTest3: Iterable<*> = "hi";
var stringTest3: Iterable<number> = "hi"; // Error - string is a Iterable<string>
