// @flow

function foo() {
  const bar = null;
  const empty = {...bar};
  (empty.x); // Error
}
