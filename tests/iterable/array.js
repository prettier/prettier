/* @flow */

var arrayTest1: Iterable<number> = ([1, 2]: Array<number>);
var arrayTest2: Iterable<number | string> = [1,2,"hi"];
var arrayTest3: Iterable<*> = [1,2,3];

// Error string ~> number
var arrayTest4: Iterable<number> = ["hi"];
// Error string ~> number
var arrayTest5: Iterable<string> = ["hi", 1];
