a = foo(
  a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition,
);
a = new Foo(
  a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition,
);
a = !(
  a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition
);
a = !!(
  a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition
);

a = foo(
  a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition,
  anotherArgument,
);
a = new Foo(
  a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition,
  anotherArgument,
);

// Different operators
a = foo(
  a_long_long_long_long_condition && a_long_long_long_long_condition && a_long_long_long_long_condition,
);
a = foo(
  a_long_long_long_long_condition ?? a_long_long_long_long_condition ?? a_long_long_long_long_condition,
);

// Not argument
a = (
  a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition
)(foo);
a = new (
  a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition
)(Foo);

// Nested
a = foo(
  (a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition)
  &&
  (a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition)
);
a = foo(
  (a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition)
  ||
  (a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition)
);
a = foo(foo(
  a_long_long_long_long_condition || a_long_long_long_long_condition || a_long_long_long_long_condition,
));
