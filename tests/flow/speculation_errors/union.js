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

type A = number | string;
(true: A);

type B = string | {p: string};
(42: B);
({p: 42}: B);

type C = string | {a: {b: string}} | boolean | {a: {b: boolean}};
(42: C);
({a: {b: 42}}: C);

type D = string | {a: string} | {a: {b: string}};
(42: D);
({a: 42}: D);
({a: {b: 42}}: D);

type E = X | {p: string};
(42: E);
(new X(): E);
(new Y(): E);
(new Z(): E);
({p: true}: E);

type F = {p: string} | $ReadOnlyArray<string> | [string, string];
(42: F);
({p: 42}: F);
({}: F);
(new Y(): F);
(new Z(): F);
(([1]: [number]): F);
(([1, 2]: [number, number]): F);
(([1, 2, 3]: [number, number, number]): F);
(((null: any): Array<number> & {p: number}): F);

type G = string | Z;
(42: G);
({}: G);

type M = W<string> | {p: string};
((new W(): W<number>): M);
