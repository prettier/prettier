//@flow

function spread<T>(x: T): { ...T, ...{||} } { return (null: any)}

let x;

if (true) {
  x = {foo: 3};
} else if (true) {
  x = {qux: 3};
} else if (true) {
  x = {foo: 3, baz: 3}
} else {
  x = {foo: 3, bar: 3}
}

type AllOpt = { foo?: number, bar?: number, baz?: number, qux?: number };

(x: AllOpt );

const a = spread(x);

if (a.bar != null) {} // bar appears in one of the branches
if (a.baz != null) {} // baz appears in one of the branches 
if (a.foo != null) {} // foo appears in one of the branches
if (a.qux != null) {} // qux appears in one of the branches
(a.foo: number); // Error, foo does not appear in all branches
(a.bar: number); // Error, bar does not appear in all branches
(a.baz: number); // Error, baz does not appear in all branches
(a.qux: number); // Error, qux does not appear in all branches

(a: AllOpt);


let y;
if (true) {
  y = {foo: 3, bar: 3}
} else if (true) {
  y = {foo: 3, baz: 3}
} else if (true) {
  y = {qux: 3};
} else {
  y = {foo: 3};
}

(y: AllOpt)

const b = spread(y);

if (b.bar != null) {} // bar appears in one of the branches
if (b.baz != null) {} // baz appears in one of the branches 
if (b.foo != null) {} // foo appears in one of the branches
if (b.qux != null) {} // qux appears in one of the branches
(b.foo: number); // Error, foo does not appear in all branches
(b.bar: number); // Error, bar does not appear in all branches
(b.baz: number); // Error, baz does not appear in all branches
(b.qux: number); // Error, qux does not appear in all branches

(b: AllOpt);

let z;

if (true) {
  z = {foo: 3}
} else if (true) {
  z = {foo: 3}
} else if (true) {
  z = {bar: 3};
} else if (true) {
  z = {baz: 3};
} else {
  z = {qux: 3};
}

const c = spread(z);

if (c.bar != null) {} // bar appears in one of the branches
if (c.baz != null) {} // baz appears in one of the branches 
if (c.foo != null) {} // foo appears in one of the branches
if (c.qux != null) {} // qux appears in one of the branches
(c.foo: number); // Error, foo does not appear in all branches
(c.bar: number); // Error, bar does not appear in all branches
(c.baz: number); // Error, baz does not appear in all branches
(c.qux: number); // Error, qux does not appear in all branches

// Equal keys create tvars with lower bounds
let union;

if (true) {
  union = {foo: 3}
} else {
  union = {foo: "string"};
}

// We use read only fields to avoid unification
const union_spread: {+foo: number | string} = spread(union); 

let optional;

if (true) {
  optional = ({foo: 3}: {foo?: number});
} else if (true) {
  optional = ({bar: 3}: {bar?: number});
} else if (true) {
  optional = ({baz: 3}: {baz?: number});
} else {
  optional = ({qux: 3}: {qux?: number});
}

const optional_spread = spread(optional);
if (optional_spread.bar != null) {} // ok 
if (optional_spread.baz != null) {} // ok
if (optional_spread.foo != null) {} // ok
if (optional_spread.qux != null) {} // ok
(optional_spread.foo: number); // Error, foo does not appear in all branches, might be undefined
(optional_spread.bar: number); // Error, bar does not appear in all branches, might be undefined
(optional_spread.baz: number); // Error, baz does not appear in all branches, might be undefined
(optional_spread.qux: number); // Error, qux does not appear in all branches, might be undefined


let optional2;

if (true) {
  optional2 = {foo: 3}
} else {
  optional2 = ({foo: 3}: {foo?: number});
}

const optional2_spread = spread(optional2); // Ok {foo?: number}

let indexer;
if (true) {
  indexer = ({foo: 3}: {[string]: number});
} else if (true) {
  indexer = ({bar: 3}: {[string]: number, bar: number});
} else if (true) {
  indexer = ({baz: 3}: {[string]: number, baz: number});
} else {
  indexer = ({qux: 3}: {[string]: number, qux: number});
}

const indexer_spread = spread(indexer);
// All ok because of the indexer. Adding bar, baz,and qux to {[string]: number} doesn't even
// change the type, since bar, baz, and qux all <: number!
if (indexer_spread.bar != null) {}
if (indexer_spread.baz != null) {}
if (indexer_spread.foo != null) {}
if (indexer_spread.qux != null) {}
(indexer_spread.foo: number);
(indexer_spread.bar: number);
(indexer_spread.baz: number);
(indexer_spread.qux: number);

let indexer2;
if (true) {
  indexer2 = ({foo: 3}: {[string]: number});
} else if (true) {
  indexer2 = ({bar: ''}: {[string]: number, bar: string});
} else if (true) {
  indexer2 = ({baz: ''}: {[string]: number, baz: string});
} else {
  indexer2 = ({qux: ''}: {[string]: number, qux: string});
}
const indexer_spread2 = spread(indexer2);
// All ok because of the indexer
if (indexer_spread2.bar != null) {}
if (indexer_spread2.baz != null) {}
if (indexer_spread2.foo != null) {}
if (indexer_spread2.qux != null) {}
(indexer_spread2.foo: string); // Error, number ~> string
(indexer_spread2.bar: string); // Error, possibly number or undefined
(indexer_spread2.baz: string); // Error, possibly number or undefined
(indexer_spread2.qux: string); // Error, Possibly number or undefined

let indexer_err;

if (true) {
  indexer_err = ({foo: 'string'}: {[string]: string})
} else {
  indexer_err = ({foo: 3}: {[string]: number})
}

const indexer_err_spread = spread(indexer_err); // Error, string and number don't unify


let indexer_on_second;
if (true) {
  indexer_on_second = {foo: 'string'};
} else {
  indexer_on_second = ({bar: 3}: {[string]: number});
}

const indexer_on_second_spread = spread(indexer_on_second);
(indexer_on_second_spread.foo: number); // Error, may be void or string
(indexer_on_second_spread.bar: number); // Error, no indexer if it's only in one branch
(indexer_on_second_spread.baz: number); // Error, no indexer if it's only in one branch
(indexer_on_second_spread.qux: number); // Error, no indexer if it's only in one branch

let inexact;
if (true) {
  inexact = {foo: 3};
} else {
  inexact = ({foo: 3}: {foo: number});
}

declare function inexactSpread<T>(x: T): {bar: 3, ...T, ...{||}};
const inexact_spread_err = inexactSpread(inexact);
