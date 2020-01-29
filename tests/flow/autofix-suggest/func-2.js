// @flow

function foo(x, y) {
  function bar(z, w) {
    return x + z + y + w;
  }
  bar(x, y);
}

foo(1, 1);
