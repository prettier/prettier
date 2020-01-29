var a = require("./cycle_A.js");

var b = {a: a, b: 0};

module.exports = b;
