type O = {
  [[call]](): void;
}

({}: O); // err: no callable property
(function() { return 0 }: O); // err: number ~> void
(function() {}: O); // ok

interface I {
  [[call]](): void;
}

({}: I); // err: no callable property
(function() { return 0 }: I); // err: number ~> void
(function() {}: I); // ok

declare class C1 {
  static [[call]](): void;
}
(C1(): empty); // error: void ~> empty

declare var mixed_callable: { [[call]]: mixed };
mixed_callable();

declare var annot_callable: { [[call]]: Fn }
type Fn = string => number;
(annot_callable("foo"): number); // OK
annot_callable(0); // error: number ~> string
(annot_callable("foo"): empty); // error: number ~> empty
