/* @flow */

type D1<X> = { p: * };

class C1<X,Y> {
  x: { p: Y };
  foo(): D1<X> { return this.x; }
}

type D2<X,Y> = { p: Y };

class C2<X,Y> {
  x: { p: Y };
  foo(): D2<X,Y> { return this.x; }
}
