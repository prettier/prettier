// small enough for one line:
function f1({ first: [inner1, inner2], second }) {}

// XXX TODO: these arguments should be destructured on multiple lines:
function f2({ first: [inner1, inner2], second: [inner3, inner4] }) {}

// XXX TODO: these arguments should be destructured on multiple lines:
function f3({ first: [inner1, inner2], second: { inner3, inner4 } }) {}
