//@flow

type P = {c?: () => void, b?: {c?: {d: number}}};
declare var cc: P;
if (cc.b?.c) {
  var xxx: number = cc.b.c.d;
}

declare var a: ?{b?: {c?: {d: number}, e: number, f: ?(() => number), g: ?(() => number)}};

if (a && a.b) {
  (a.b: {}); //ok
  (a.b.c: ?{}); //ok
  (a.b.c?.d: ?number); //ok
  a.b.c.d; // bad
  (a?.b.c?.d: ?number); // ok, one unneeded optional chain
  (a?.b.e: number); // ok, one unneeded optional chain
  (a.b?.e: number); // ok, one unneeded optional chain
}

if (a && a.b) {
  (a.b?.f(): ?number); // unneeded chain and bad
}

if (a && a.b) {
  (a.b.f?.(): ?number); // ok
}

if (a && a.b) {
  (a.b?.f?.(): ?number); // ok, one unneeded optional chain
}

if (a && a.b && a.b.g) {
  (a.b.g(): number); // ok
}

if (a && a.b && a.b.g) {
  (a.b.g?.(): number); // ok, unneeded chain
}

if (a && a.b && a.b.g) {
  (a.b?.g(): number); // ok, unneeded chain
}

if (a && a.b && a.b.g) {
  (a.b?.g?.(): number); // ok, two unneeded chains
} else {
  (a: {}); // should fail, sanity check
  (a: (null | void)); // should fail, sanity check
}

function f<T: any>(x: ?T) {
  if (x?.a === null) {
    return;
  }
  if (x) {
    (x.a: empty) // ok
  }
  (x.a: empty) // should fail
}

if (a?.b) {
  (a.b: {}); //ok
  (a.b.c: ?{}); //ok
  (a.b.c?.d: ?number); //ok
  a.b.c.d; // bad
  (a?.b.c?.d: ?number); // ok, one unneeded optional chain
  (a?.b.e: number); // ok, one unneeded optional chain
  (a.b?.e: number); // ok, one unneeded optional chain
}

if (a?.b) {
  (a.b?.f(): ?number); // unneeded chain and bad
}

if (a?.b) {
  (a.b.f?.(): ?number); // ok
}

if (a?.b) {
  (a.b?.f?.(): ?number); // ok, one unneeded optional chain
}

if (a?.b?.g) {
  (a.b.g(): number); // ok
}

if (a?.b?.g) {
  (a.b.g?.(): number); // ok, unneeded chain
}

if (a?.b?.g) {
  (a.b?.g(): number); // ok, unneeded chain
}

if (a?.b?.g) {
  (a.b?.g?.(): number); // ok, two unneeded chains
} else {
  (a: {}); // should fail, sanity check
  (a: (null | void)); // should fail, sanity check
}
type Z = {| a: "hello ", value: number |} | {| b: "goodbye", value: string |}
declare var b: ?{x: boolean, y?: boolean, z: Z, w?: {u: () => number}};

if (b?.x) {
  (b.x: true); // ok
} else {
  (b.x: false); // nope
}

if (b?.w.u) { // error here
  (b: {}); // ok
  b.w.u(); // ok, because of error in predicate
}

if (b && b.w.u) { // error consistent with above
  b.w.u(); // no error consistent with above
}

if (b?.z.a) {
  (b.z.value: number); // yes
} else {
  (b.z.value: string); // error
}

if (b?.y) {// sketchy null
  (b.y: true); // ok
} else {
  (b.y: false); // nope
}

declare var c: Array<?Array<{a: number, b: {c: {d: string}}}>>;
if (c[0]?.[0].b.c) {
  (c[0][0].a: number); //yes
  (c[0][0].b: {}); //yes
  (c[1][0]: {}); // no
  (c[0][1].a: number); // yes
}

declare var d: ?{a?: () => {b?: {c: number}}, d: number};
if (d?.a?.().b) {
  (d.a().b.c: number); // nope, never was a refinement in the first place
}

declare var a11: ?({a: string} | {});
declare var b11: ?{};
// No error on looking up a11?.a, but that's consistent with non-optional behavior
var x11: empty = a11?.a || b11?.a;

declare var e: ?string;
if (e?.length) { }
