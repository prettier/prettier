// @flow
const untyped = require('./lib/untyped');

let x : any = 3; // explicit
let y : Function = {}; // explicit
let z : Object = {}; // explicit

let a = x; // explicit
let b = z.f1; // implicit
let c = y(3); // implicit

let u = untyped.f1; // implicit
let v = untyped; // implicit

let unsound1 = (() => {}).constructor; // implicit
let unsound2 : $ElementType<{f1 : number}, string> = 1; // implicit

let num : number = 3;
//$Broken
let str : string = num;
let m = str;

let arr = [x];
let arr2 = [u];

declare function foo<T>(arg : T) : T => void;
let bar = foo(x);
let baz = foo(u);
