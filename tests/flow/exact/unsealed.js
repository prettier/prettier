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
f(o); // error: o incompatible with exact type

function g() { o.p = 0 }
