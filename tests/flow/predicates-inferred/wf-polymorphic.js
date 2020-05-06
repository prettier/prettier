// @flow

function f1<X>(x: X): X %checks { return x; } // error: poly return in %checks
function f2<X>(x: X): [X, X] %checks { return [x, x]; } // error: poly return in %checks
function f3<X>(x: X): mixed %checks { return x; } // okay
function f4<X>(x: X): %checks { return x; } // okay

declare function g<X>(x: X): X %checks(x); // error: poly return in %checks
