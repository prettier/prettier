// @flow

function foo() {
  // Comment 0
  const x = {
    // Comment 1
    f: 1,
    // Comment 2
    g: 2,
    // Comment 3
    h:
    // Comment 4
      "blah",
  }
  // Comment 5
  return x;
}
module.exports = { foo };
