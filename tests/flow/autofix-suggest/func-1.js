// @flow

function foo(x, y) {
  return x + y(x);
}

foo(1, (z) => z + 1);
