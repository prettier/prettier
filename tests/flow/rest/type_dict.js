// @flow

declare opaque type X;
declare opaque type Y;
declare var x: X;
declare var y: Y;

type O1 = $Rest<{|y: Y|}, {|[string]: Y|}>;
declare var o1: O1;
(o1: {||}); // Error: missing y
(o1: {|y: Y|}); // Error: y is optional
(o1: {|y?: Y|}); // OK
(o1: {|y?: X|}); // Error: Y = X
({}: O1); // OK
({y}: O1); // OK
({y: x}: O1); // Error: X ~> Y

type O2 = $Rest<{|y: Y|}, {|[string]: X|}>; // Error: Y ~> X
declare var o2: O2;
(o2: {|y?: Y|}); // OK

type O3 = $Rest<{|y: Y|}, {[string]: Y}>;
declare var o3: O3;
(o3: {||}); // Error: missing y
(o3: {|y: Y|}); // Error: y is optional
(o3: {|y?: Y|}); // OK
(o3: {|y?: X|}); // Error: Y = X
({}: O3); // OK
({y}: O3); // OK
({y: x}: O3); // Error: X ~> Y

type O4 = $Rest<{y: Y}, {|[string]: Y|}>;
declare var o4: O4;
(o4: {|y?: Y|}); // Error: inexact ~> exact
(o4: {}); // OK
(o4: {y: Y}); // Error: y is optional
(o4: {y?: Y}); // OK
(o4: {y?: X}); // Error: Y = X
({}: O4); // OK
({y}: O4); // OK
({y, x}: O4); // OK
({y: x}: O4); // Error: X ~> Y

type O5 = $Rest<{y: Y}, {[string]: Y}>;
declare var o5: O5;
(o5: {|y?: Y|}); // Error: inexact ~> exact
(o5: {}); // OK
(o5: {y: Y}); // Error: y is optional
(o5: {y?: Y}); // OK
(o5: {y?: X}); // Error: Y = X
({}: O5); // OK
({y}: O5); // OK
({y, x}: O5); // OK
({y: x}: O5); // Error: X ~> Y

type O6 = $Rest<{y: Y}, {|[string]: X|}>; // Error: Y ~> X
declare var o6: O6;
(o6: {y?: Y}); // OK

type O7 = $Rest<{|y: Y|}, {[string]: X}>; // Error: Y ~> X
declare var o7: O7;
(o7: {|y?: Y|}); // OK

type O8 = $Rest<{|y?: Y|}, {|[string]: Y|}>;
declare var o8: O8;
(o8: {|y?: Y|}); // OK

type O9 = $Rest<{|y?: Y|}, {|[string]: Y | void|}>;
declare var o9: O9;
(o9: {|y?: Y|}); // OK

type O10 = $Rest<{|x: X, y: Y|}, {|[string]: X | Y|}>;
declare var o10: O10;
(o10: {|x?: X, y?: Y|}); // OK

type O11 = $Rest<{|x: X, y: Y|}, {[string]: X | Y}>;
declare var o11: O11;
(o11: {|x?: X, y?: Y|}); // OK

type O12 = $Rest<{x: X, y: Y}, {|[string]: X | Y|}>;
declare var o12: O12;
(o12: {x?: X, y?: Y}); // OK

type O13 = $Rest<{|[string]: X|}, {|[string]: Y|}>; // Error: X ~> Y
declare var o13: O13;
(o13: {|[string]: X | void|}); // OK

type O14 = $Rest<{|[string]: X|}, {|[string]: X|}>;
declare var o14: O14;
(o14: {|[string]: X | void|}); // OK

type O15 = $Rest<{|x: X, [string]: Y|}, {|[string]: X | Y|}>;
declare var o15: O15;
(o15: {|x?: X, [string]: Y | void|}); // OK

type O16 = $Rest<{|[string]: X|}, {|y: Y|}>; // Error: X ~> Y and void ~> Y
declare var o16: O16;
(o16: {|[string]: X|}); // OK

type O17 = $Rest<{|x: X, [string]: Y|}, {|x: X, [string]: Y|}>;
declare var o17: O17;
(o17: {|[string]: Y | void|}); // OK
