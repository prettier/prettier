interface F {
  (): void;
}

var f0: F = () => 0; // error: number ~> void
var f1: F = () => {}; // ok
