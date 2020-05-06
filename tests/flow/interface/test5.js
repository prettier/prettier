interface A {
  x: number;
  x(): void;
}

interface B {
  x(): void;
  x: number;
}

declare var a: A;
(a.x: empty); // error: function ~> empty

declare var b: B;
(b.x: empty); // error: number ~> empty
