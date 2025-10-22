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
