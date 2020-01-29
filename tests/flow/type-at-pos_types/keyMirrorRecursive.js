// @flow

export type KeyMirrorRecursive<O> = $ObjMapi<
  O,
  (<X: {}>(mixed, X) => KeyMirrorRecursive<X>) & (<K>(K) => K),
>;

declare function keyMirrorRecursive<O: {}>(
  obj: O,
  _: void,
): KeyMirrorRecursive<O>;

module.exports = keyMirrorRecursive;
