//@flow
function f<A:number, B:number>(a: A, b: B): A {
  return a + b
}
//var x: number = f(14, "broken");
var y: 42 = f<42, 9>(42, 9);
