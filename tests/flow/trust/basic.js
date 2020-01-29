// @flow
var x: $Trusted<number> = (42: any); //Fail
var y: $Trusted<number> = 42; //ok
var z: any = y; // ok

function f(x: number): $Trusted<number> { return x; } // Fail without inference, ok with

function g(x: $Trusted<number>): $Trusted<number> { return x; } //Ok

function h(x: $Trusted<number>): number { return x; } //Ok

var a = 42; //Ok
var b: number = 42; // ok
var c: $Trusted<number> = 42; // ok

var i: $Trusted<number> = a; //ok
var k: $Trusted<number> = b; // fail without inference, ok with
var j: $Trusted<number> = c; // ok
var l: number = c; // ok
var m = c; // ok

var d = 42; // ok
d = ('Hello': any) // ok
var e: $Trusted<number> = d; // fail
