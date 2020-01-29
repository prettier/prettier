// @flow

declare opaque type X;
declare opaque type Y;
declare var x: X;
declare var y: Y;
declare var o: {||};

// Some of the test types in this module are polymorphic in X and Y, for
// example O1<X, Y> so that we re-evaluate the $Rest type whenever we use it.

type O1<X, Y> = $Rest<{|x: X|} | {|y: Y|}, {|x: X | void|}>;
(o: O1<X, Y>); // OK
({x}: O1<X, Y>); // Error: x is not allowed
({y}: O1<X, Y>); // OK
({x, y}: O1<X, Y>); // Error: x is not allowed

type O2<X, Y> = $Rest<{|x: X|} | {|y: Y|}, {|y: Y | void|}>;
(o: O2<X, Y>); // OK
({x}: O2<X, Y>); // OK
({y}: O2<X, Y>); // Error: y is not allowed
({x, y}: O2<X, Y>); // Error: y is not allowed

type O3 = $Rest<{|x: X|} | {|y: Y|}, {|x: X, y: Y|}>; // Error: void ~> X and void ~> Y
(o: O3); // OK

type O4 = $Rest<{|x: X|} | {|y: Y|}, {|x: X | void, y: Y | void|}>;
(o: O4); // OK
({x}: O4); // Error: x is not allowed
({y}: O4); // Error: y is not allowed
({x, y}: O4); // Error: x and y are not allowed

type O5 = $Rest<{|x: X, y: Y|}, {|x: X|} | {|y: Y|}>;
(o: O5); // Error: missing x and missing y
({x}: O5); // OK
({y}: O5); // OK
({x, y}: O5); // Error: x and y are not allowed together

type O6 = $Rest<{|x: X|}, {|x: X|} | {|y: Y|}>; // Error: void ~> Y
(o: O6); // OK

type O7 = $Rest<{|y: Y|}, {|x: X | void|} | {|y: Y|}>;
(o: O7); // OK
({x}: O7); // Error: x is not allowed
({y}: O7); // OK
({x, y}: O7); // Error: x is not allowed

type O8 = $Rest<{|x: X|} | {|y: Y|}, {|x: X|} | {|y: Y|}>; // Error: void ~> X and void ~> Y
(o: O8); // OK

type O9 = $Rest<{|x: X|} | {|y: Y|}, {|x: X | void|} | {|y: Y | void|}>;
(o: O9); // OK
({x}: O9); // OK
({y}: O9); // OK
({x, y}: O9); // Error: x and y are not allowed together
