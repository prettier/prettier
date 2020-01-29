/**
 * @format
 * @flow
 */

type T = {p: mixed};

let a = 0;
const f = (x: mixed): mixed => x;
const o = {p: 42};

declare var React: {createElement: React$CreateElement};
function MyComponent() {}

((([]: empty): T).p: empty);
((([1]: empty): T).p: empty);
((([1, 2, 3]: empty): T).p: empty);
(((() => {}: empty): T).p: empty);
(((() => 42: empty): T).p: empty);
(((() => ({}): empty): T).p: empty);
((((a = 42): empty): T).p: empty);
((((a >>>= 42): empty): T).p: empty);
(((({a} = {a: 42}): empty): T).p: empty);
(((([a] = [42]): empty): T).p: empty);
((((a = a = 42): empty): T).p: empty);
(((1 + 2: empty): T).p: empty);
(((1 + 2 + 3: empty): T).p: empty);
(((1 - (2 + 3): empty): T).p: empty);
((((1 + 2) * (3 + 4): empty): T).p: empty);
(((1 + 2 * (3 + 4): empty): T).p: empty);
(((f(): empty): T).p: empty);
(((f(42): empty): T).p: empty);
(((class {}: empty): T).p: empty);
((((1 ? 2 : 3): empty): T).p: empty);
(((((1 ? 2 : 3) ? 4 : 5): empty): T).p: empty);
(((function() {}: empty): T).p: empty);
(((a: empty): T).p: empty);
(((import('fs'): empty): T).p: empty);
(((<MyComponent />: empty): T).p: empty);
(((<>foo</>: empty): T).p: empty);
((('foo': empty): T).p: empty);
((('abcdefghijklmnopqrstuvwxyz': empty): T).p: empty);
(((42: empty): T).p: empty);
(((true: empty): T).p: empty);
(((false: empty): T).p: empty);
(((null: empty): T).p: empty);
(((o.p: empty): T).p: empty);
(((new f(): empty): T).p: empty);
(((new f(42): empty): T).p: empty);
((({}: empty): T).p: empty);
((((1, 2, 3): empty): T).p: empty);
class X extends class {
  m() {}
} {
  m() {
    (((super.m: empty): T).p: empty);
  }
}
(((f`foobar`: empty): T).p: empty);
(((`foobar`: empty): T).p: empty);
(function() {
  (((this: empty): T).p: empty);
}.call(42));
((((42: string): empty): T).p: empty);
(((-42: empty): T).p: empty);
(((!42: empty): T).p: empty);
(((++a: empty): T).p: empty);
(((a++: empty): T).p: empty);
function* g1(): Generator<number | void, void, number> {
  (((yield: empty): T).p: empty);
  (((yield 42: empty): T).p: empty);
}
function* g2(): Generator<number | void, void, number> {
  (((yield* g1(): empty): T).p: empty);
}
