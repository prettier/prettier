// @flow

declare class Base {}
class B extends Base {}

function foo() { return B };

module.exports = foo();
