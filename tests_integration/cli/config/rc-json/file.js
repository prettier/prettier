/* eslint-disable */

function f() {
  console.log.apply(null, [
    "this file",
    "should have trailing comma",
    "and single quotes",
  ]);
}
