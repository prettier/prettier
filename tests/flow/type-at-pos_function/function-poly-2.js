// @flow

function outer<T>(y: T) {
  function inner<T>(x: T, z) {
    y;
    inner(x, x);
    return x;
  }
  const x = inner(1, y);

  function inner_<T>(x: T) {
    return x;
  }
}
