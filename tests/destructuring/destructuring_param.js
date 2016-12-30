function f(a, { b }) {
  return a + b;
}

// TODO: These throw errors when parsing.
// function g(a, { a }) {
//   return a;
// }

// function h({ a, { b } }, { c }, { { d } }) {
//   return a + b + c + d;
// }
