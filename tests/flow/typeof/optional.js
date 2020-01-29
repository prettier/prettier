function f<A>(a: A): {p?: A} {
  if (true) {
    return {};
  } else {
    return {p: a};
  }
}
var x = f(42).p;
(null: typeof x); // error: null ~> $Optional<number> (i.e., void|number)
