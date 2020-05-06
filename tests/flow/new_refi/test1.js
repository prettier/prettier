/* @flow */

function g() {
  var xx : { p : number } | null = { p : 4 };
  if (xx) {
    return function () {
       /* B : invariant x != undefined needed even if x is not modified elsewhere */
       xx.p = 3;
    }
  }
}
