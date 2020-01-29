// @flow

var a = { p: 0 };
(a.q ? a.q : "foo");
(a.q: mixed); // An error here

var b = { p: 0 };
if (b.q) {} else {};
(b.q: mixed); // is an error here
