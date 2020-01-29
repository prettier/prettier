//setting up for next test
/*flowlint sketchy-null:off*/ //unused suppression

//error: not a real lint or setting, but sketchy-null is still enabled
/*flowlint not-a-real-lint : not-a-real-setting   ,
    sketchy-null:error */

// ExistsP sketchy checks

// maybe
function f(x: ?number) {
  //not suppressed because the suppression comes after it on the line
  if (x) {/* sketchy */}/* flowlint sketchy-null:off */
}

// union
function h(x: number|null) {
  if (x) { /* sketchy; suppressed */ }
}

// non-void, non-null
function g(x: number) {
  if (x) { /* NOT sketchy */ }
}

// non-falsey prim
function k(x: null | 1) {
  if (x) { /* NOT sketchy */ }
}

//multi-line test

/*

	 flowlint

  	 sketchy-null-bool:error,

  	 sketchy-null-mixed:error

 	 */

var x1: ?bool = false;
if (x1) { /* sketchy */ }

//docblock-style tests

/*
 * flowlint
 * sketchy-null-bool:off,
 * sketchy-null-mixed:off
 *
 */

var x2: ?bool = false;
if (x2) { /* sketchy; suppressed */ }

/*
 * flowlint
 * sketchy-null:
 *    error,
 * sketchy-null-bool:
 *    off
 */ //The bool suppression is unused

var x3: ?string = "";
if (x3) { /* sketchy */ }

// open, multiple lowers
function j(x) {
  if (x) { /* NOT sketchy because of calls */ }
}
j(null);
j("foo"); // non-falsey, non sketchy

function r(x) {
  if (x) { /* sketchy because of calls */ }
}
r(null);
r("")

function w(x) {
  if (x) { /* sketchy because of calls; Not suppressed */ }
}
w(null);
// This suppression comment is at the wrong location and does nothing, so
// appears as an unused suppression comment
/*flowlint sketchy-null:off*/w("");/*flowlint sketchy-null:error*/

function s(x) {
  if (x) { /* sketchy because of calls */ }
}
s(null);
declare var unknown_str: string;
s(unknown_str); // possibly falsey, sketchy

// PropExistsP sketchy checks

// optional prop
function l(o: { p?: number, ... }) {
  if (o.p) {/* sketchy; suppressed */} //flowlint-line sketchy-null:off
}

// maybe prop
function m(o: { p: ?number, ... }) {
  /* flowlint-next-line sketchy-null:off */
  if (o.p) {/* sketchy; suppressed */}
}

// union
function n(o: { p: number|null|void, ... }) {
  /*flowlint sketchy-null:off*/ //Unused suppression
  // flowlint-next-line sketchy-null:error
  if (o.p) { /* sketchy */ }
  // flowlint sketchy-null:error
}

function q(o: { p: number, ... }) {
  if (o.p) { /* NOT sketchy */ }
}

// Assignment

/*
Line suppressions don't have unexpected effects on later lines (the
unsuppression at the end of the line doesn't affect the existing range setting.)
*/
function z(x: ?string) {
  var assignee;
  //flowlint sketchy-null:off
  //flowlint-next-line sketchy-null:off
  if (assignee = x) { /* sketchy; suppressed */ }
  if (assignee = x) { /* sketchy; suppressed */ }
  //flowlint sketchy-null:error
}

var value: ?number = 0;
var defaultVal: number = 7;
var valToUse = value || /* flowlint-line sketchy-null:off */defaultVal; /* sketchy; suppressed */

var alwaysFalse = false && value; /* NOT sketchy */
var alwaysTrue = true || value; /* NOT sketchy */

//flowlint sketchy-null:error
var val2: ?number = 0;
/*flowlint sketchy-null:off*/ //Unused suppression

var sketchyFalse = val2 && false; /* sketchy */ /*flowlint-next-line sketchy-null:error*/ /* flowlint-line sketchy-null:error */
var sketchyTrue = val2 || true; /* sketchy */

//Malformed Rule Tests

//Extra commas
// flowlint ,sketchy-null-bool:error,,sketchy-null-mixed:error,

//Missing commas
// flowlint sketchy-null-bool:error sketchy-null-mixed:off

//Typo on flowlint (Not checked for at the moment. Perhaps in a future diff?)
// flowline sketchy-null:error

//Flowlint inside a comment (Not checked for at the moment. Perhaps in a future diff?)
/*
 * stuff, stuff, stuff
 * flowlint sketchy-null:error
 */
