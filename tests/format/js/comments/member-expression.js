blablablablablablablabla.hellohellohellohellohellohellohellohellohellohello
  // @ts-expect-error
  .dayOfWeek;

a.b
  // comment
  .d;

a
  // comment
  .b;

a.b // trailing comment

a /* inline comment */ .b;

a. /* inline after dot */ b;

a.b
  // comment
  .d();

a?.b
  // comment
  ?.d;

a.b
  // comment
  ?.d;

a?.b
  // comment
  .d;

a
  // comment
  ?.b;

a.b
  /* block comment */
  .d;

a.b
  /* block comment */ .d;

a
  // comment
  [b];

const x =
  // top
  a.b
  // mid
  .c;

a
  // c1
  .b
  // c2
  .c;

a.b // trailing
  // leading
  .d;

a.b
  // comment
  .d = 1;

a.b()
  // comment
  .d;

function f() {
  return a.b
    // comment
    .d;
}
