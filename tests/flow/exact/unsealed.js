/* An unsealed object is not compatible with an exact object type, as arbitrary
   properties can be added to an unsealed object. */

function f(o: {p: string} | $Exact<{}>): string {
  if (o.p) {
    return o.p;
  } else {
    return "";
  }
}

var o = {};
g();
f(o);

function g() { o.p = 0 } // error: cannot write a number to o because it later expects a string
