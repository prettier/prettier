type Foo = {
  field: number,
}

var x: {field?: number} = {};
var y: $Shape<Foo> = x;
(y.field: number)

function f () {}

var a : $Shape<Foo> = f(); // error
var b : $Shape<Foo> = null; // error

function baz (n : null, m : void) {}
baz(y, y)

class PointB {
  x: number;
  y: number;
}

class PointC {
  x: number;
  y: number;
}

type IPoint = {
  x: number;
  y: number;
}

declare var pc: PointC;
declare var pi: IPoint;
declare var ps: $Shape<IPoint>;

(pc: IPoint);
(pc: $Shape<IPoint>);
(pc: $Shape<PointB>);
(pc: {x : number});
(pc: $Shape<{x : number}>); // error

(pi: PointC); // error
(pi: $Shape<PointC>);
(pi: {x : number});
(pi: $Shape<{x : number}>); // error

(ps: PointC); // error
(ps: IPoint);
(ps: {x : number});
(ps: $Shape<{x : number}>); // error

class C {
  x: number;
}

type A = {
  +x: number;
}

type B = {
  x: number;
}

declare var a_ : A;
declare var b_ : B;
declare var c_ : C;

(a_ : $Shape<A>);
(a_ : $Shape<B>);
(a_ : $Shape<C>);

(b_ : $Shape<A>);
(b_ : $Shape<B>);
(b_ : $Shape<C>);

(c_ : $Shape<A>);
(c_ : $Shape<B>);
(c_ : $Shape<C>);

class One {
  foo : number
  constructor(x : number) {
    this.foo = x;
  }
}

class Two {
  foo : number
  constructor() {
    this.foo = 1;
  }
}

type Three = { foo : number, constructor() : () => void }

let one = new One(3);
let two = new Two();

(one : One);
(one : Two); // error
(one : Three); // error
(one : $Shape<One>);
(one : $Shape<Two>); // error
(one : $Shape<Three>);

(two : One); // error
(two : Two);
(two : Three);  // error
(two : $Shape<One>); // error
(two : $Shape<Two>);
(two : $Shape<Three>);
