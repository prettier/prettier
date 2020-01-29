// @flow

enum E {
  A,
  B,
}

enum F {
  A,
  B,
}

const e = E.A;
const eo: typeof E = E;
const maybeE: ?E = null;
const ef: E | F = E.A;

const s: string = "hi";

// Comparison of enums with == or != is banned
s == e; // Error
e == s; // Error

s != e; // Error
e != s; // Error

e == E.A; // Error
ef == E.A; // Error
F.A == E.A; // Error

eo == s; // Error

// Except comparison of enum to null or void, it is allowed
maybeE != null; // OK
maybeE != undefined; // OK

// Strict comparison
s === e; // Error
e === s; // Error

s !== e; // Error
e !== s; // Error

e === E.A; // OK
e === e; // OK

if (e === E.A) { } // Error
if (E.A === e) { } // Error
if (s.length > 0 && e === E.A) { } // Error

while (e === E.A) { } // OK
do {} while (e === E.A) // OK
for (; e === E.A;) {} // OK

(e === E.A ? 1 : 2); // OK

switch (true) {
  case s === E.A: break; // Error
}
