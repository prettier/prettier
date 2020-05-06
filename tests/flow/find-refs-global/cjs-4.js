// @flow
const {foo, foo2} = require('./cjs-1');
const {bar: d, bar2, bar3} = require('./cjs-2');
const baz = require('./cjs-3');
foo;
foo2;
d;
bar2;
bar3;
baz.c;
