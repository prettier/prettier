type A = ( // comment
  | Foo
  | Bar
) & Baz;

type B = (
  // comment
  | Foo
  | Bar
) & Baz;

type C = ( // comment
  Foo
) & Baz;

type D = ( // comment
  | Foo
  | Foo
  | Foo
  | Foo
  | Foo
  | Foo
  | Foo
  | Foo
  | Foo
  | Foo
  | Foo
  | Foo
) &
  Foo;

let e: ( // comment
  | Foo
  | Bar
) & Baz;
