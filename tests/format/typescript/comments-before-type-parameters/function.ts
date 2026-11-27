declare function a
    /*[FLOW2DTS - Warning] Covariance and contravariance are ignored.*/
    <T, U, V extends Number, W = String>(t: T, u: U, v: V, w: W): void;

declare function b /* comment */ <T>(value: T): T;

declare function c /* comment */
<T>(value: T): T;

const anonymous = function /* comment */ <T>(value: T): T { return value; };

declare function nonGeneric /* comment */ (value: string): string;

function d
/* comment */
<T>(value: T): T { return value; }

const e = function named
/* comment */
<T>(value: T): T { return value; };

declare function f
// comment
<T>(value: T): T;

declare function g // comment
<T>(value: T): T;

declare function h
/* first */
/* second */
<T>(value: T): T;
