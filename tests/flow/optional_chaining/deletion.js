//@flow

declare var x: ?{a: number, b?: {c: number}};
declare var y: ?{[string]: number};
declare var z: {d: ?{c: number}}
declare var w: ?{g: {e: ?number}};
declare var w2: {g: {e: ?number}};

delete x?.a; // error from writing undefined to number, otherwise ok
delete x?.b?.c; // error from writing undefined to number, otherwise ok
delete y?.['a']; // ok
delete z.d?.c; // error from writing undefined to number, otherwise ok
delete z?.d; // unnecessary chain
delete w?.g.e; // ok
delete w?.g?.e; // one unnecessary chain
delete w2?.g?.e; // two unnecessary chains

declare var a: ?{a: ?number}
delete a?.a;
(a.a: empty); // don't refine a.a to definitely exist

// optional chain in parens doesn't short-circuit
(w?.g).e = 42; // should fail
delete (w?.g).e; // should fail
