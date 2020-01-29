/**
 * @format
 * @flow
 */

type A = {p: string};
declare var a1: {p: number};
(a1: A); // Error: string ~> number. We should point to a1.
declare var a2: number;
({p: a2}: A); // Error: string ~> number. We should point to a2.
({p: 42}: A); // Error: string ~> number. We should point to 42.

type B = {a: {b: string}};
declare var b1: {a: {b: number}};
(b1: B); // Error: string ~> number. We should point to b1.
declare var b2: {b: number};
({a: b2}: B); // Error: string ~> number. We should point to b2.
declare var b3: number;
({a: {b: b3}}: B); // Error: string ~> number. We should point to b3.
({a: {b: 42}}: B); // Error: string ~> number. We should point to 42.

type C = {a: {b: {c: string}}};
declare var c1: {a: {b: {c: number}}};
(c1: C); // Error: string ~> number. We should point to c1.
declare var c2: {b: {c: number}};
({a: c2}: C); // Error: string ~> number. We should point to c2.
declare var c3: {c: number};
({a: {b: c3}}: C); // Error: string ~> number. We should point to c3.
declare var c4: number;
({a: {b: {c: c4}}}: C); // Error: string ~> number. We should point to c4.
({a: {b: {c: 42}}}: C); // Error: string ~> number. We should point to 42.

type D = {a: {b: {c: {d: string}}}};
declare var d1: {a: {b: {c: {d: number}}}};
(d1: D); // Error: string ~> number. We should point to d1.
declare var d2: {b: {c: {d: number}}};
({a: d2}: D); // Error: string ~> number. We should point to d2.
declare var d3: {c: {d: number}};
({a: {b: d3}}: D); // Error: string ~> number. We should point to d3.
declare var d4: {d: number};
({a: {b: {c: d4}}}: D); // Error: string ~> number. We should point to d4.
declare var d5: number;
({a: {b: {c: {d: d5}}}}: D); // Error: string ~> number. We should point to d5.
({a: {b: {c: {d: 42}}}}: D); // Error: string ~> number. We should point to 42.
