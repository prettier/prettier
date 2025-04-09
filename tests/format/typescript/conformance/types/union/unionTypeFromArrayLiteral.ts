﻿// The resulting type an array literal expression is determined as follows:
// If the array literal is empty, the resulting type is an array type with the element type Undefined.
// Otherwise, if the array literal is contextually typed by a type that has a property with the numeric name ‘0’, the resulting type is a tuple type constructed from the types of the element expressions.
// Otherwise, the resulting type is an array type with an element type that is the union of the types of the element expressions.

var arr1 = [1, 2]; // number[]
var arr2 = ["hello", true]; // (string | number)[]
var arr3Tuple: [number, string] = [3, "three"]; // [number, string]
var arr4Tuple: [number, string] = [3, "three", "hello"]; // [number, string, string]
var arrEmpty = [];
var arr5Tuple: {
    0: string;
    5: number;
} = ["hello", true, false, " hello", true, 10, "any"]; // Tuple
class C { foo() { } }
class D { foo2() { } }
class E extends C { foo3() { } }
class F extends C { foo4() { } }
var c: C, d: D, e: E, f: F;
var arr6 = [c, d];  // (C | D)[]
var arr7 = [c, d, e]; // (C | D)[]
var arr8 = [c, e]; // C[]
var arr9 = [e, f]; // (E|F)[]
