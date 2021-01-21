// small enough for one line:
function f1({ first: { inner1, inner2 }, second }) {}

// these arguments should be destructured on multiple lines:
function f2({ first: { inner1, inner2 }, second: { inner3, inner4 } }) {}

// small enough for one line:
function f3({ first: { inner1, inner2 }, second } = {}) {}

// XXX TODO: these arguments should be destructured on multiple lines:
function f4({ a: { inner1, inner2 }, b: { inner3, inner4 } } = {}) {}

const obj = {
  // these arguments should be destructured on multiple lines:
  func({ a: { info1, info2 }, b: { info3, info4 } }) {}
};

class A {
  // these arguments should be destructured on multiple lines:
  func({ a: { info1, info2 }, b: { info3, info4 } }) {}
}
