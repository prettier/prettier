// @flow

declare var a: "a";
declare var single_quote: "'";
declare var double_quote: '""';
declare var backslash: '\\';

function f1() { return a; }
function f2() { return single_quote; }
function f3() { return double_quote; }
function f4() { return backslash; }
