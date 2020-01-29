//@flow

type T = {a: null | number}
declare var t: ?T;
if (t?.a === null) {
  (t: T); // yes
  (t.a: null); // yes
} else {
  (t: (null | void)); // no
  (t.a: number); // no for two reasons
}
if (t?.a !== null) {
  (t: (null | void)); // no
  (t.a: number); // no for two reasons
} else {
  (t: T); // yes
  (t.a: null); // yes
}

type S = {a: ?number};
declare var s: ?S;
if (s?.a == null) {
  (s: S); // no, may be nulled
  (s.a: (null | void)); // no for two reasons
} else {
  (s: S); // yes
  (s.a: number); // yes: s cannot be null and s.a cannot be null or void
}
if (s?.a != null) {
  (s: S); // yes
  (s.a: number); // yes: s cannot be null and s.a cannot be null or void
} else {
  (s: S); // no, may be nulled
  (s.a: (null | void)); // no for two reasons
}
if (s?.a === undefined) {
  (s: S); // no, may be nulled
  (s.a: (null | void)); // no for two reasons
} else {
  (s: S); // yes
  (s.a: number); // no: s.a can be null
  (s.a: (number | null)); //yes
}
if (s?.a == undefined) {
  (s: S); // no, may be nulled
  (s.a: (null | void)); // no for two reasons
} else {
  (s: S); // yes
  (s.a: number); // yes: s cannot be null and s.a cannot be null or void
}

type W = {a: number};
declare var w: ?W;

if (w?.a === 42) {
  (w: W);
  (w.a: 42);
} else {
  (w: W); // no
  w.a; // no
}

declare var a: ?{b: number | string};
if (typeof a?.b === 'number') {
  (a.b: number);
  (a: {});
} else {
  a.b; // nope
  (a: (null | void));// nope
}

declare var b: ?{a?: number};
if (typeof b?.a === 'undefined') {
  b.a; //nope
  (b: (null | void)); // nope
} else {
  (b: {});
  (b.a: number);
}

if (b?.a instanceof Object) {
  (b.a: number);
  (b: {});
} else {
  b.a; // nope
  (b: (null | void)); // nope
}

declare var c: ?{d?: Array<number>};
if (Array.isArray(c?.d)) {
  (c.d[0]: number);
  (c: {});
} else {
  c.d; //nope
  (c: (null | void)); //nope
}


// should not cause refinement with current model
declare var b1: ?{a?: number};
declare var c1: number;
if (b1?.a === c1) {
  (b1?.a: number) // b1.a may not exist and may not be number
}
