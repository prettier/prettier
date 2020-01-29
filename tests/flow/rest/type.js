// @flow

declare opaque type X;
declare opaque type Y;
declare var x: X;
declare var y: Y;

type O1 = $Rest<{|x: X, y: Y|}, {|y: Y|}>;
declare var o1: O1;
(o1: {||}); // Error: missing x
(o1: {|x: X|}); // OK
(o1: {|x?: X|}); // Error: x is not optional
(o1: {|x: X, y?: Y|}); // Error: y is not in O1
(o1: {|x?: X, y?: Y|}); // Error: x is not optional and y is not in O1
(o1: {|x: Y|}); // Error: X = Y
({y}: O1); // Error: missing x
({x}: O1); // OK
({x, y}: O1); // Error: y is not in O1
({x: y}: O1); // Error: Y ~> X

type O2 = $Rest<{|x: X, y: Y|}, {|y: X|}>;
declare var o2: O2;
(o2: {|x: X|}); // Error: Y ~> X

type O3 = $Rest<{|x: X, y: Y|}, {y: Y}>;
declare var o3: O3;
(o3: {||}); // Error: missing x and y
(o3: {|x: X|}); // Error: x is optional and missing y
(o3: {|x?: X|}); // Error: missing y
(o3: {|x: X, y?: Y|}); // Error: x is optional
(o3: {|x?: X, y?: Y|}); // OK
(o3: {|x: Y|}); // Error: X = Y, x is optional, and missing y
({}: O3); // OK
({x}: O3); // OK
({x, y}: O3); // OK
({x: y}: O3); // Error: Y ~> X

type O4 = $Rest<{|x: X, y: Y|}, {|y?: Y|}>;
declare var o4: O4;
(o4: {||}); // Error: missing x and y
(o4: {|x: X|}); // Error: missing y
(o4: {|x?: X|}); // Error: x is not optional and missing y
(o4: {|x: X, y?: Y|}); // OK
(o4: {|x?: X, y?: Y|}); // Error: x is not optional
(o4: {|x: Y|}); // Error: X = Y, and missing y
({y}: O4); // Error: missing x
({x}: O4); // OK
({x, y}: O4); // OK
({x: y}: O4); // Error: Y ~> X

type O5 = $Rest<{x: X, y: Y}, {|y: Y|}>;
declare var o5: O5;
(o5: {|x?: X|}); // Error: inexact ~> exact
(o5: {}); // OK
(o5: {x: X}); // Error: x is optional
(o5: {x?: X}); // OK
(o5: {x: X, y?: Y}); // Error: x is optional and y is not in O5
(o5: {x?: X, y?: Y}); // Error: y is not in O5
(o5: {x: Y}); // Error: x is optional and X = Y
({}: O5); // OK
({x}: O5); // OK
({x, y}: O5); // OK
({x: y}: O5); // Error: Y ~> X

type O6 = $Rest<{x: X, y: Y}, {y: Y}>;
declare var o6: O6;
(o6: {|x?: X, y?: Y|}); // Error: inexact ~> exact
(o6: {}); // OK
(o6: {x: X}); // Error: x is optional
(o6: {x?: X}); // OK
(o6: {x: X, y?: Y}); // Error: x is optional
(o6: {x?: X, y?: Y}); // OK
(o6: {x: Y}); // Error: X = Y, x is optional
({}: O6); // OK
({x}: O6); // OK
({x, y}: O6); // OK
({x: y}: O6); // Error: Y ~> X

type O7 = $Rest<{x: X, y: Y}, {|y?: Y|}>;
declare var o7: O7;
(o7: {|x?: X, y?: Y|}); // Error: inexact ~> exact
(o7: {}); // OK
(o7: {x: X}); // Error: x is optional
(o7: {x?: X}); // OK
(o7: {x: X, y?: Y}); // Error: x is optional
(o7: {x?: X, y?: Y}); // OK
(o7: {x: Y}); // Error: X = Y and x is optional
({}: O7); // OK
({x}: O7); // OK
({x, y}: O7); // OK
({x: y}: O7); // Error: Y ~> X

type O8 = $Rest<{x: X, y: Y}, {|y: X|}>; // Error: Y ~> X
declare var o8: O8;
(o8: {x?: X}); // OK

type O9 = $Rest<{|x: X, y: Y|}, {y: X}>; // Error: Y ~> X
declare var o9: O9;
(o9: {|x?: X, y?: Y|}); // OK

type O10 = $Rest<{|x: X, y: Y|}, {|y?: X|}>; // Error: Y ~> X
declare var o10: O10;
(o10: {|x: X, y?: Y|}); // OK

type O11 = $Rest<{|x: X, y?: Y|}, {|y: Y|}>; // Error: void ~> Y
declare var o11: O11;
(o11: {|x: X|}); // OK

type O12 = $Rest<{|x: X|}, {|y: Y|}>; // Error: void ~> Y
declare var o12: O12;
(o12: {|x: X|}); // OK

type O13 = $Rest<{|x: X, y?: Y|}, {|y: Y | void|}>;
declare var o13: O13;
(o13: {|x: X|}); // OK

type O14 = $Rest<{|x: X|}, {|y: Y | void|}>;
declare var o14: O14;
(o14: {|x: X|}); // OK

type O15 = $Rest<{|x: X, y: Y|}, {|y?: Y|}>;
declare var o15: O15;
(o15: {|x: X, y?: Y|}); // OK

type O16 = $Rest<{|x: X, y: Y|}, {y: Y}>;
declare var o16: O16;
(o16: {|x?: X, y?: Y|}); // OK

type O17 = $Rest<{|x: X, y?: Y|}, {|y?: Y|}>;
declare var o17: O17;
(o17: {|x: X, y?: Y|}); // OK
