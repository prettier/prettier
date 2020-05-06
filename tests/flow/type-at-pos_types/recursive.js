// @flow

var o = { m() { return this; } };
o.m();

function alist(n: number) {
  if (n <= 0) return null;
  else return { data: n, next: alist(n - 1) };
}

const a = alist(10);

function blist(n: number) {
  if (n <= 0) return null;
  if (n > 1)  return "";
  return {
    data: n,
    a_next: alist(n - 1),
    next: blist(n-1),
  };
}

function clist(n: number) {
  if (n <= 0) return null;
  if (n > 1) return "";
  return {
    data: n,
    a_next: alist(n - 1),
    b_next: blist(n - 1),
    next: clist(n - 1),
  };
}

function foo(x) {
  return x(x);
}

foo(x => x);

type Foo = { n: typeof foo };
function bar(x: Foo) {}

// The following exhibits a use of the RemoveTopLevelTvarVisitor
//
// mu X . ((X | string) | string)
// ==>
// mu X . ((Bot | string) | string)
// ==>
// mu X . (string | string)
// ==>
// mu X . string
// ==>
// string
let x = "";
while (0 < 1) {
  x = (0 < 1) ? x : "";
}
x;

type CA<+T> = $ReadOnlyArray<CA<T>>;
