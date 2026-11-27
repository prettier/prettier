function* f() {
  yield (a, b);
  yield (aLongIdentifierName, aLongIdentifierName, aLongIdentifierName, aLongIdentifierName);
  yield* (aLongIdentifierName, aLongIdentifierName, aLongIdentifierName, aLongIdentifierName);
  yield (
    // comment
    a, b
  );
}
