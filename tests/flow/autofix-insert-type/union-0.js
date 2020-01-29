// @flow

function foo(x) { }

foo(1);
foo("1");
foo(1);
foo(2);
foo(() => foo());
foo();
