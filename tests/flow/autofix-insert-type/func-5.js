// @flow
function throws_arg() {
  if (Math.random() < 0.5) {
    return 42;
  } else {
    throw 42;
  }
}
