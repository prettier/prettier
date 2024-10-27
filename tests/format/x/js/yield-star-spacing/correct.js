// correct for:
// * "yield-star-spacing": [ "error", "both" ]
// but *not* for the following standard.js rules:
// * "generator-star-spacing": [ "error", "both" ],
// * "space-before-function-paren": [ "error", "always" ],
// * "semi": [ "error", "never" ],

function* generator() {
  yield * other();
  // ensure this one is *not* affected:
  yield "done";
}
