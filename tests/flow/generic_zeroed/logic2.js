//@flow
function f<A, B>(a: A, b: B): A {
  return a && b
}
var x: number = f(14, "broken");
