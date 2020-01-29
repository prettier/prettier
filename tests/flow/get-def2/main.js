// @flow

var Parent = require('./Parent');

// Hops through destructuring
let ParentFoo;
({ParentFoo} = Parent);
ParentFoo; // Points to lval in line above this

// Follows assignment on simple/"non-destructuring" patterns
let Parent2;
Parent2 = Parent;
Parent2; // Points to LHS of line above this

// Follows assignment with declaration
let Parent3 = Parent;
Parent3; // Points to LHS of line above this

// Follows non-destructured property access of `require('Parent')`
let foo = require('./Parent').ParentFoo.foo;
foo;

import type {Foo} from './types';
function takesFoo(foo: Foo) { }

{
  let require = (x : string) => x === './Parent';
  let adopted = require('./Parent');
  adopted;
}

var Child = require('./Child');
Child.ChildFoo.foo;
