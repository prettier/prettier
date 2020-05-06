//@flow
function f<A:string, B:string>(a: A, b: B): A {
  return a && b
}
//var x: number = f(14, "broken");
var y: "a" = f<"a", "b">("a", "b");

function compareGeneric<T: number>(a: T, b: T): boolean {
  return a < b;
}

function compareGeneric2<T: number, S: number>(a: T, b: S): boolean {
  return a < b;
}
