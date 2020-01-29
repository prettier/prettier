// @flow


type Foo<T = string> = {};

function foo(): Foo<string> { return {}; }

module.exports = foo();
