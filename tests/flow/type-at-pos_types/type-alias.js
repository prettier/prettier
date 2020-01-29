// @flow

type A = A;
type B = B | null;
type C = A;
type D = { x: number };
type E = $Exact<D>;
type F = ?D;

type P<T: string> = { t: T } | boolean;
declare var a: P<string>;
if (typeof a !== "boolean") a;

function f<X>() {
  type A = X;
  type B = B | null;
  type C = A;
  type D = { x: X };
  type E = $Exact<X>;
  type F = ?X;
}

type G<X> = X | null;
type H = G<number>;
type I = G<G<number> | string>
type J<X> = (<X>(x: X) => void) | X | null;
type K = J<number>;
type L<X, Y> = (<X>(x: X, y: Y) => void) | X | Y | null;
type M<Z> = L<number, Z>;
type N<A> = { x: N<A> } | null;
type O = N<number>

class Klass {};
type TKlass = typeof Klass;
