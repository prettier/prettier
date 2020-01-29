// @flow

type X = {
  bar: ?(() => number),
};

declare var foo: ?X;

(foo?.bar?.(): empty);
(foo.bar?.(): empty);
(foo?.bar(): empty);
((foo?.bar)(): empty);

declare var a: { b: ?(() => ?{c: ?{d: number}}), c: ?{d: ?{e:number}}, d: ?{e: {f: () => {g: number}}} };
var y: empty = a.b?.()?.c?.d;
var x: empty = a.c?.d?.e;
var w: empty = a.d?.e.f().g;

declare var b: {onClick?: () => number};
var f: empty = b.onClick !== null ? b.onClick?.() : 42;

declare var c: ?Array<?(() => ?Array<?Array<number>>)>;
var z: empty = c?.[0]?.()?.[0]?.[0]

// Ensure intersections work
class A {
  a: ?(() => number)
}

class B {
  b: ?(() => number)
}

declare var ab: ?(A & B);

ab?.a?.();
ab?.b?.();

// Ensure refinements work
type P = {c?: () => void, b?: {c?: {d: number}}};
declare var cc: P;
if (cc.c) {
  cc?.c();
}
