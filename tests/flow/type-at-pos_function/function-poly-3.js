// @flow

var x = 1;
function foo<T: string>(y: T) {
  x = y;
}
foo("");
x;
