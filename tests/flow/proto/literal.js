var o = { p: 0, __proto__: { q: 1 } };
(o.p: empty); // error: number ~> empty
(o.q: empty); // error: number ~> empty

var o_get = { get __proto__() { return { q: 1 } } };
(o_get.q: empty); // error: property `q` not found
(o_get.__proto__: { q: number }); // ok

var o_set = { set __proto__(x) {} };
(o_set.__proto__: empty); // error: read from contravariant prop

var o_method = { __proto__() {} };
(o_method.__proto__: empty); // error: function ~> empty

var __proto__ = { q: 1 };
var o_shorthand = { __proto__ };
(o_shorthand.q: empty); // error: property `q` not found
(o_shorthand.__proto__: { q: number }); // ok

var o_computed = { ["__proto__"]: 0 }; // TODO: computed props use SetElem :/
(o_computed.__proto__: empty); // TODO: error: number ~> empty

var o_loop = { p: 0, __proto__: o_loop }; // error: void (undefined o_loop) is not a valid proto
(o_loop.p: empty); // error: number ~> empty
(o_loop.q: empty); // error: property `q` not found

var o_invalid = { __proto__: 0 }; // error: 0 is not a valid proto
