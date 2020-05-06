//@flow
declare opaque type Foo<+T>: {p:T}; // Error, invariant use of T
function f(foo: Foo<string>): string {
  var foo2: Foo<string|null> = foo; // OK, by covariance
  foo2.p = null; // Uh oh...
  return foo.p; // ...boom
}
