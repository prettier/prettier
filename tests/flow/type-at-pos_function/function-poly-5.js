// @flow

function foo<T: number | string>(x: T) {
  if (typeof x === 'number') {
    return x
  } else {
    return 1;
  }
}
