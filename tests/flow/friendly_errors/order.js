/**
 * @format
 * @flow
 */

// Should be ordered by the root location. So the errors on 42 and true should
// point to 42 and true but appear together before the error on 'foo'!
({
  a: 42,
  b: ('foo': empty),
  c: true,
}: {
  a: boolean,
  c: number,
});
