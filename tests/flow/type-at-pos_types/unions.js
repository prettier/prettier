// @flow

declare function random(): boolean;

let foo = () => "";
if (random()) {
  foo = () => 0;
}
foo;

let bar = (x: string) => {};
if (random()) {
  bar = (x: number) => {};
}
bar;

declare var numObj: { +f: number };
declare var strObj: { +f: string };

let obj = numObj;
if (random()) {
  obj = strObj;
}
obj;

class G<X> {
  x: X;
  constructor(x: X) {
    this.x = x;
  }
  get_X(): X {
    return this.x;
  }
  set_X(x: X): void {
    this.x = x;
  }
}

var sg: G<string> = new G("");
var ig = new G(1);

var g = (0 < 1) ? sg : ig;
g.get_X
g.set_X

// exhibits use of Ty_normalizer.simplify_unions_inters_visitor

declare var top : mixed | mixed | number;
top;

declare var top_g : { g: mixed | mixed | number};
top_g;

type A = { f: number }
var a1 = { f: 1 };
var a2 = { f: 2 };
var a = (0<1) ? a1 : a2;

declare var maybe_empty: ?empty;
