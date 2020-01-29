/**
 * @format
 * @flow
 */

class X {
  p: number;
}
class Y {
  p: number;
}
class Z {}
class W<T> {
  p: T;
}

declare function a(x: number): void;
declare function a(x: string): void;
a(true);

declare function b(x: string): void;
declare function b(x: {p: string}): void;
b(42);
b({p: 42});

declare function c(x: string): void;
declare function c(x: {a: {b: string}}): void;
declare function c(x: boolean): void;
declare function c(x: {a: {b: boolean}}): void;
c(42);
c({a: {b: 42}});

declare function d(x: string): void;
declare function d(x: {a: string}): void;
declare function d(x: {a: {b: string}}): void;
d(42);
d({a: 42});
d({a: {b: 42}});

declare function e(x: X): void;
declare function e(x: {p: string}): void;
e(42);
e(new X());
e(new Y());
e(new Z());
e({p: true});

declare function f(x: {p: string}): void;
declare function f(x: $ReadOnlyArray<string>): void;
declare function f(x: [string, string]): void;
f(42);
f({p: 42});
f({});
f(new Y());
f(new Z());
f(([1]: [number]));
f(([1, 2]: [number, number]));
f(([1, 2, 3]: [number, number, number]));
f(((null: any): Array<number> & {p: number}));

declare function g(x: string): void;
declare function g(x: Z): void;
g(42);
g({});

declare function h(a: string, b: string): void;
declare function h(a: number, b: {}, c: string): void;
h(1, 2, 3);

declare function i(a: Y, b: string): void;
declare function i(a: X, b: number): void;
i(new Y(), 42);

declare function j(a: number, b: string): void;
declare function j(a: string, b: number): void;
j(1, 2);

declare function k(a: number, b: {p: string}): void;
declare function k(a: string, b: {p: number}): void;
k(1, {p: 2});

declare function m(x: W<string>): void;
declare function m(x: {p: string}): void;
m((new W(): W<number>));
