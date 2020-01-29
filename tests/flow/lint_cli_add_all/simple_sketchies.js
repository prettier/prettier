// ExistsP

// maybe
function f(x: ?number) {
  if (x) {/* sketchy */}
}

// union
function h(x: number|null) {
  if (x) { /* sketchy */ }
}

// non-void, non-null
function g(x: number) {
  if (x) { /* NOT sketchy */ }
}

// non-falsey prim
function k(x: null | 1) {
  if (x) { /* NOT sketchy */ }
}

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
r(""); // definitely falsey, sketchy

function s(x) {
  if (x) { /* sketchy because of calls */ }
}
s(null);
declare var unknown_str: string;
s(unknown_str); // possibly falsey, sketchy

// PropExistsP

// optional prop
function l(o: { p?: number, ... }) {
  if (o.p) {/* sketchy */}
}

// maybe prop
function m(o: { p: ?number, ... }) {
  if (o.p) {/* sketchy */}
}

// union
function n(o: { p: number|null|void, ... }) {
  if (o.p) { /* sketchy */ }
}

function q(o: { p: number, ... }) {
  if (o.p) { /* NOT sketchy */ }
}

// Assignment

function z(x: ?string) {
  var assignee;
  if (assignee = x) { /* sketchy */ }
}

var value: ?number = 0;
var defaultVal: number = 7;
var valToUse = value || defaultVal; /* sketchy */

var alwaysFalse = false && value; /* NOT sketchy */
var alwaysTrue = true || value; /* NOT sketchy */

var sketchyFalse = value && false; /* sketchy */
var sketchyTrue = value || true; /* sketchy */
