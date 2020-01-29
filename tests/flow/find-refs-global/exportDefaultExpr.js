// @flow

function foo() {}

export default (1, function foo() { foo(); });

// This refers to the first foo function, since the `export default` contains
// a function expression which is not in top-level scope.
foo();
