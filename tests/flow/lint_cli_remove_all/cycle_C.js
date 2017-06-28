var vars = require("./cycle_B.js")

function f(x) {
  if (x); /* sketchy because of uses */
}

var resNull = f(null);
var resB = f(vars.b);

module.exports = {resA: resNull, resB: resB};
