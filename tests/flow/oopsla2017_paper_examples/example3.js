// @flow

let nil = { kind: "nil" };
let cons = (head, tail) => {
  return { kind: "cons", head, tail };
}

function sum(list) {
  if (list.kind === "cons") {
    return list.head + sum(list.tail); // ok
  }
  return 0;
}
sum(cons(6, cons(7, nil)));
