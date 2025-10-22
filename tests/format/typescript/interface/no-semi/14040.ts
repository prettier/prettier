interface A1 {
  foo;
  <T>(): T;
}
type A2 = {
  foo;
  <T>(): T;
}
type A3 = {foo;
  <T>(): T;
}

interface B1 {
  foo;
  (): X
}
type B2 = {
  foo;
  (): X
}
type B3 = {foo;
  (): X
}

interface C1 {
  get;
  foo(): X
}
type C2 = {
  get;
  foo(): X
}
type C3 = {get;
  foo(): X
}

interface D1 {
  set;
  foo(): X
}
type D2 = {
  set;
  foo(): X
}
type D3 = {set;
  foo(): X
}

interface E1 {
  static;
  foo(): X
}
type E2 = {
  static;
  foo(): X
}
type E3 = {static;
  foo(): X
}

interface F1 {
  [get];
  foo(): X
}
type F2 = {
  [get];
  foo(): X
}
type F3 = {[get];
  foo(): X
}

interface G1 {
  foo: X;
  <T>(): T;
}
type G2 = {
  foo: X;
  <T>(): T;
}
type G3 = {foo: X;
  <T>(): T;
}

