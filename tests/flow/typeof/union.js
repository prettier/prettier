function f<A, B>(a: A, b: B): A | B {
  if (true) {
    return a;
  } else {
    return b;
  }
}
const x = f(42, 'foo');
(null: typeof x); // error: null ~> number|string
