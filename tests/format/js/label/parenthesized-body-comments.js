{
  foo: (
    // comment
    {
      bar: "baz",
    }
  )
}

foo: ( // comment
  { bar: "baz" }
);

foo: (
  /* comment */
  { bar: "baz" }
);

foo: (
  // comment 1
  // comment 2
  { bar: "baz" }
);

foo: (
  // comment
  bar
);

foo: (
  // comment
  function () {}
);

foo: (
  // comment
  a, b
);

foo: (
  // comment
  a
) + b;

foo: (
  // comment
  a
).b;

foo: (
  // comment
  a
)();

foo: ((
  // comment
  a
) + b).c;

foo: (/* comment */ { bar: "baz" });

foo: (
  { bar: "baz" }
  // comment
);

foo: a + (
  // comment
  b
);
