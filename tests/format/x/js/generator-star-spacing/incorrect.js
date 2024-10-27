// *incorrect* for the following standard.js rules:
// * "generator-star-spacing": [ "error", { "before": true, "after": true } ],
// * "space-before-function-paren": [ "error", "always" ],
// * "semi": [ "error", "never" ],

function* generator() {}
var anonymous = function* () {};
var shorthand = { * generator() {} };
function *generator() {}
var anonymous = function *() {};
var shorthand = { *generator() {} };
