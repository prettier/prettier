// @flow
//
import * as Test from './test';
import {hide, type ID, type TransparentMyNum} from './test';

var hideCJS = require('./test').hide;

function subtraction(x: ID, y: ID) : ID {
    return Test.addition(x,y);
}

function castTo(x: number) : ID {
    return hide(x);
}

function identity(x: ID) : ID {
    return x;
}

function caseFrom(x : ID) : number {
    return Test.expose(x);
}

function empty(x : empty) : ID {
    return x;
}

function toAny(x : ID) : any {
    return x;
}

type IDT = ID;

function toIDT(x: ID) : IDT {
    return x;
}

function toID(x : IDT) : ID {
    return x;
}

Test.expose(Test.hide(3));

opaque type OpaqueMyNum = number;

function testA(x: TransparentMyNum): OpaqueMyNum { return x; }
function testB(x: OpaqueMyNum): TransparentMyNum { return x; }

export type {OpaqueMyNum};

hideCJS(0);
