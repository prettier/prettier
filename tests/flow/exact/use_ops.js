declare var a: { p: { q: null } };
var b: { p: {| q: null |} } = a; // error a != b, with nested info for a.p != b.p

function f(o: {| p: null |}) {}
declare var o: { p: null };
f(o); // error: inexact arg incompatible with exact param (error should indicate exactness issue)
