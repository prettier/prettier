// @flow

var o = {};
function f() {
  if (o.p) {} // OK, o is unsealed and p may be added later
}
o.p = 0; // like so
