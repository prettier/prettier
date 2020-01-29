//@flow

10;
var x = 10;
var y: number = 10;


function f(x: number): number {
  return x;
}

function g(x: number): number {
  return f(x);
}

//g(("a": any));

var a: number = g(10);
var b = a;
var c: number = b;
var d: number = b;
d = (42: any);
var e: $Trusted<number> = c;
