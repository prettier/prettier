// @flow
const x: boolean => (() => number) = b => {
  var val = b ? 0: null;
  if (val == null) {
    return () => 42;
  }
  return () => val; // OK, since val cannot be null
}
