function* f() {
  // Line terminators are not allowed between `yield` and its argument, so the
  // parentheses must be kept.
  yield (/*
  */ a);

  yield (// comment
  a);

  yield (/* comment */
  a);

  yield (/*
  */ a + b);

  // Safe, the comment doesn't span lines.
  yield (/* comment */ a);
}
