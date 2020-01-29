// No errors are expected in this file.

function f() {
  const a = [...arguments];
  g(...arguments);
  g.apply(null, arguments);
}

function g() {}
