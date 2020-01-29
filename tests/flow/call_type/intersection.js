// @flow

declare opaque type A;
declare opaque type B;
declare var a: A;

type X = $Call<(<T>(T) => T) & (<T>(T) => T), A | B>;

(a: X); // OK
function foo(x: X): A { return x; } // error
function bar(x: X): B { return x; } // error
