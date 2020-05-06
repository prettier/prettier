// @flow

// These functions are provided just to illustrate the danger of aliasing `module` and
// `module.exports`.
function addsAProp(x) {
  x.foo = '42';
}

function addsAPropToExports(x) {
  x.exports.bar = '42';
}

addsAProp(module.exports);
addsAProp(module['exports']);
addsAProp(exports);
addsAPropToExports(module);

module.exports['foo'] = 42;
module['exports'] = {};
exports['foo'] = 42;

(5, exports).foo = 1;
(5, module).exports.foo = 34;

function h() {
  exports['foo'] = 42;
  exports.foo = 5;
  exports.foo;
  module.exports.foo;
}

function g() {
  // We don't know when this function may be called, clobbering `module` and `exports`, so we can't
  // allow this.
  module = {};
  exports = {};
}

function f() {
  let module = {};
  let exports = {};
  // These should all be fine, since `module` and `exports` have been shadowed.
  module.exports = {};
  exports = {};
  exports.foo = 42;
  module.exports.foo = 42;
  addsAPropToExports(module);
}

// This is a pattern recommended by Node, and shold be allowed.
if (require.main === module) { }
// This doesn't need to be allowed, the above can be special-cased.
if (require.main === (5, module)) { }

// This should be okay since `module` is rebound. Unfortunately it currently errors due to a bug in
// scope_builder.
switch ('') { case '': const module = ''; module; };

// Property accesses should be okay since they cannot alias or mutate `module` or `exports`.
module.id;
exports.foo;
