// @flow

function outer<T>(y: T) {
  function inner<T>(x: T, z) {
    inner(x, x);
  }
}
