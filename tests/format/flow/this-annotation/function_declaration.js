// @flow

function foo (this : number, a : string, b) {}

function bar (this : number) {}

function baz (this : number, ...a) {}
