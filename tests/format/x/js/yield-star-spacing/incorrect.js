// *incorrect* for the following standard.js rules:
// * "yield-star-spacing": [ "error", "both" ]
// * "generator-star-spacing": [ "error", "both" ],
// * "space-before-function-paren": [ "error", "always" ],
// * "semi": [ "error", "never" ],


function *generator() {
  yield *other();
  // ensure this one remains correct:
  yield "done";
}
function* generator() {
  yield* other();
  // ensure this one remains correct:
  yield "done";
}
function*generator() {
  yield*other();
  // ensure this one remains correct:
  yield "done"
}
