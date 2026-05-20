const value = () =>
  (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    (foo.bar()) as Foo
  ).baz;
