// https://github.com/prettier/prettier/issues/20306
function t(window) {
  delete (/** @type {any} */ window).__pwned;
}

delete (/* comment */ a).b;
!(/* comment */ a).b;
!(/* comment */ a).b.c;
!(/* comment */ a)();
!(/* comment */ a)`tagged`;
!(/* comment */ a)?.b;
!(/* comment */ a)++;
typeof (/* comment */ a).b;
void (/* comment */ a).b;

!(/* comment */ a + b).c;
!(/* comment */ a ? b : c).d;
!(/* comment */ a).b + c;

!(
  // comment
  a
).b;
!(
  /* comment */
  a
)();
