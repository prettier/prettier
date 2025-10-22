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
  (): X
}
type C2 = {
  get;
  (): X
}
type C3 = {get;
  (): X
}

interface D1 {
  set;
  (): X
}
type D2 = {
  set;
  (): X
}
type D3 = {set;
  (): X
}

interface E1 {
  static;
  (): X
}
type E2 = {
  static;
  (): X
}
type E3 = {static;
  (): X
}

interface C1 {
  [get];
  (): X
}
type C2 = {
  [get];
  (): X
}
type C3 = {[get];
  (): X
}
