declare opaque type A;
declare opaque type B: A;

class C<+Out, -In: Out = Out> {}

declare var x: C<B>;
(x: C<A>); // error: A ~> B in default-expanded type
