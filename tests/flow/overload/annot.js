declare function f(x: string): void;
declare function f(x: number): void;

type T = null;
declare var x: T;
f(x); // error should point to `x` here, not at type alias
