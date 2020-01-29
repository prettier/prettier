// @flow

function foo(x) {}

foo({
  m() { return 1; },
  n: () => 2,
  l: function bar() {}
});
