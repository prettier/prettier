async function* f() {
  return (
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa &&
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb &&
    cccccccccccccccc
  );

  yield (
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa &&
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb &&
    cccccccccccccccc
  );

  await (
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa &&
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb &&
    cccccccccccccccc
  );
}
