// @flow

declare var obj: {a?: {b: ?{c: null | {d: number}}}};

let _ =
  obj.a ?
    (obj.a.b ?
      (obj.a.b.c ?
        (obj.a.b.c.d ? obj.a.b.c.d : null) :
        null) :
      null) :
    null;

let myobj = {
  m(n: string) { return n; },
  n: (k: number) => k
};

myobj.m;
myobj.m("a");
myobj.n;
myobj.n(1);

declare var litobj: {
  f: "ff";
  g: "g\"g";
  h: 'h"h';
  i: "i'i";
  j: '\'';
  d: 11;
  x: 0x111;
  b: 0b111;
}

litobj;
