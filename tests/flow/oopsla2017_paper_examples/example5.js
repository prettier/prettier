// @flow

let nil = { kind: "nil" };
let cons = (head, tail) => {
  return { kind: "cons", head, tail };
}

function havoc(x) {
  let reset = () => { x = null; }
  x = x || nil;
  reset();
  return x.kind; // error
}
havoc(cons(7, nil));
