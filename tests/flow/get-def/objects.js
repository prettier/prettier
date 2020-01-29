/* @flow */

type Foo = {foo: string};
const a: Foo = {foo: ''};
a.foo;

const b = {foo: ''};
b.foo;

const c = {};
c.foo = '';
c.foo;
c.baz;
c.baz = '';
c.bar;
c.bar;

{
  const {foo} = a;
  const {foo: bar} = a;
};
{ const {foo} = b; }
{ const {foo} = c; }
{ const [foo] = a; }
{ const foo = a.foo; }
