function foo() {}
const args = [3, 4];

foo(1, 2); // error
foo(
  1, // error
  2,
);
foo(...args); // error

foo.call(null, 1, 2); // error
foo.call(null, ...args); // error
foo.call(null, 1, 2, ...args); // error

foo.apply(null, [1, 2]); // error
foo.apply(null, args); // error

foo.bind(null, 1, 2); // error
foo.bind(null, ...args); // error
foo.bind(null, 1, 2, ...args); // error

new foo(1, 2); // error
new foo(...args); // error
new foo(1, 2, ...args); // error
