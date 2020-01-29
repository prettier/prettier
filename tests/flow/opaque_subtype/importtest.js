// @flow

import {type Counter, type OtherCounter, type SuperOpaque, type PolyFoo, type PolyBar, type PolyGood, type ID} from './test';
import type {SuperType} from './super';

function test1 (y: SuperType) : SuperOpaque { // Error: number ~> SuperOpaque
    return y;
}

function test2 (x: SuperOpaque): SuperType { // Ok
    return x;
}

function test3 (x: number): Counter {// Error: number ~> Counter
    return x;
}

function test4(x: Counter): number {// Ok
    return x;
}

function test5(x: PolyGood<number>): PolyFoo<number> { // Ok
    return x;
}

function test6(x: PolyGood<number>): PolyBar<number> { // Error: PolyFoo ~> PolyBar
    return x;
}

function test7(x: PolyGood<number>): PolyFoo<string> { // Error: number ~> string
    return x;
}

function test8(x: ID): number { // Ok
    return x.length;
}

function test9(x: SuperType): SuperType { // Error number ~> SuperType
    return x++; // Error number ~> SuperType
}

function test10(x: SuperType): number { // Ok
    var y = x + 1;
    return y;
}

function test11(x: ID, y: ID): string { // Ok
    return x + y;
}

function test12(x: ID, y: ID): number { // Error: string ~> number
    return x + y;
}

function takesString(x: string): number { // Ok
    return x.length;
}

function test13(x: ID): number { // Ok
    return takesString(x);
}

function id<T>(x: T): T { return x; } // Ok

function test14(x: ID): string { // Ok
    var y: string = x;
    return id(y) + id(x);
}
