//@flow

function composenum(f: (number)=>number, g: (number)=>number): (number)=>number {
  function ret(x:number): number {
    return f(g(x));
  }
  return ret;
}

function id(x: number): number {
  return x;
}

var a: number = composenum(id, id)((42: any));
var b: $Trusted<number> = a;
