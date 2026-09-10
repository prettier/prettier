function* f() {
  // Line terminators are not allowed between `yield` and its argument, so the
  // parentheses must be kept.
  yield (/*
  */ a);

  yield (// comment
  a);

  yield (/*
  */ a + b);

  yield (/*
  */ a, b);

  yield (/* comment */
  a);

  // Safe, the comment is printed on one line.
  yield (/* comment */ a);

  // `yield*` is not restricted, but it is printed the same way.
  yield* (/*
  */ a);
}
