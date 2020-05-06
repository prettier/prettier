// @flow

import React from 'react';

declare var any: any;

React.createFactory(any)(); // OK
React.createFactory(any)({}); // OK
React.createFactory(any)(undefined); // OK
React.createFactory(any)(null); // OK

class A extends React.Component<{foo: number, bar: number}, void> {}
function B(props: {foo: number, bar: number}) { return null }

const aFactory = React.createFactory(A);
const bFactory = React.createFactory(B);

aFactory({foo: 1, bar: 2}); // OK
bFactory({foo: 1, bar: 2}); // OK
aFactory({
  foo: 42,
  bar: 'Hello, world!', // Error: `bar` is a string.
});
bFactory({
  foo: 42,
  bar: 'Hello, world!', // Error: `bar` is a string.
});
aFactory({foo: 42}); // Error: `bar` is missing.
bFactory({foo: 42}); // Error: `bar` is missing.
aFactory(undefined); // Error: `foo` and `bar` are missing.
bFactory(undefined); // Error: `foo` and `bar` are missing.
aFactory(null); // Error: `foo` and `bar` are missing.
bFactory(null); // Error: `foo` and `bar` are missing.
(aFactory({foo: 1, bar: 2}).type: Class<A>); // OK
(bFactory({foo: 1, bar: 2}).type: typeof B); // OK
(aFactory({foo: 1, bar: 2}).props.foo: number); // OK
(bFactory({foo: 1, bar: 2}).props.foo: number); // OK
(aFactory({foo: 1, bar: 2}).props.foo: boolean); // Error: `foo` is `number`.
(bFactory({foo: 1, bar: 2}).props.foo: boolean); // Error: `foo` is `number`.
aFactory({foo: 1, bar: 2}).nope; // Error: `nope` does not exist.
bFactory({foo: 1, bar: 2}).nope; // Error: `nope` does not exist.
aFactory(); // Error: Missing `foo` and `bar`.
bFactory(); // Error: Missing `foo` and `bar`.

class C extends React.Component<{foo: number, bar: number}, void> {
  static defaultProps = {bar: 42};
}
function D(props: {foo: number, bar: number}) { return null }
D.defaultProps = {bar: 42};

const cFactory = React.createFactory(C);
const dFactory = React.createFactory(D);

cFactory({foo: 1, bar: 2}); // OK
dFactory({foo: 1, bar: 2}); // OK
cFactory({
  foo: 42,
  bar: 'Hello, world!', // Error: `bar` is a string.
});
dFactory({
  foo: 42,
  bar: 'Hello, world!', // Error: `bar` is a string.
});
cFactory({foo: 42}); // OK: `bar` is in `defaultProps`.
dFactory({foo: 42}); // OK: `bar` is in `defaultProps`.
(cFactory({foo: 42}).props.bar: number); // OK
(dFactory({foo: 42}).props.bar: number); // OK

const anyFactory = React.createFactory(any);

anyFactory({whateverYouWant: 'yes'}); // OK

class E extends React.Component<{children: number}, void> {}
const eFactory = React.createFactory(E);
eFactory({}); // Error
eFactory(undefined); // Error
eFactory(null); // Error
eFactory({}, 1); // OK
eFactory(undefined, 1); // OK
eFactory(null, 1); // OK
eFactory({}, 1, 2); // Error
eFactory(undefined, 1, 2); // Error
eFactory(null, 1, 2); // Error
eFactory({}, 1, 2, 3); // Error
eFactory({}, [1, 2]); // Error
eFactory({}, [1, 2], [3, 4]); // Error
eFactory({}, ...[]); // Error
eFactory({}, ...[1]); // OK
eFactory({}, ...[1, 2]); // Error
eFactory({}, ...(any: Array<number>)); // Error
eFactory({}, 1, ...[]); // OK
eFactory({}, 1, ...[2]); // Error
eFactory({}, 1, ...(any: Array<number>)); // Error

class F extends React.Component<{children: Array<number>}, void> {}
const fFactory = React.createFactory(F);
fFactory({}); // Error
fFactory(undefined); // Error
fFactory(null); // Error
fFactory({}, 1); // Error
fFactory(undefined, 1); // Error
fFactory(null, 1); // Error
fFactory({}, 1, 2); // OK
fFactory(undefined, 1, 2); // OK
fFactory(null, 1, 2); // OK
fFactory({}, 1, 2, 3); // OK
fFactory({}, [1, 2]); // OK
fFactory({}, [1, 2], [3, 4]); // Error
fFactory({}, ...[]); // Error
fFactory({}, ...[1]); // Error
fFactory({}, ...[1, 2]); // OK
fFactory({}, ...(any: Array<number>)); // Error
fFactory({}, 1, ...[]); // Error
fFactory({}, 1, ...[2]); // OK
fFactory({}, 1, ...(any: Array<number>)); // Error

class G extends React.Component<{children: number | Array<number>}, void> {}
const gFactory = React.createFactory(G);
gFactory({}); // Error
gFactory({}, 1); // OK
gFactory({}, 1, 2); // OK
gFactory({}, 1, 2, 3); // OK
gFactory({}, [1, 2]); // OK
gFactory({}, [1, 2], [3, 4]); // Error
gFactory({}, ...[]); // Error
gFactory({}, ...[1]); // OK
gFactory({}, ...[1, 2]); // OK
gFactory({}, ...(any: Array<number>)); // Error
gFactory({}, 1, ...[]); // OK
gFactory({}, 1, ...[2]); // OK
gFactory({}, 1, ...(any: Array<number>)); // OK

type NumberArrayRecursive = number | Array<NumberArrayRecursive>;
class H extends React.Component<{children: NumberArrayRecursive}, void> {}
const hFactory = React.createFactory(H);
hFactory({}); // Error
hFactory({}, 1); // OK
hFactory({}, 1, 2); // OK
hFactory({}, 1, 2, 3); // OK
hFactory({}, [1, 2]); // OK
hFactory({}, [1, 2], [3, 4]); // OK
hFactory({}, ...[]); // Error
hFactory({}, ...[1]); // OK
hFactory({}, ...[1, 2]); // OK
hFactory({}, ...(any: Array<number>)); // Error
hFactory({}, 1, ...[]); // OK
hFactory({}, 1, ...[2]); // OK
hFactory({}, 1, ...(any: Array<number>)); // OK

class I extends React.Component<{children?: number}, void> {}
const iFactory = React.createFactory(I);
iFactory({}); // OK
iFactory({}, undefined); // OK
iFactory({}, null); // Error
iFactory({}, 1); // OK
iFactory({}, 1, 2); // Error
iFactory({}, ...[]); // OK
iFactory({}, ...[1]); // OK
iFactory({}, ...[1, 2]); // Error
iFactory({}, ...(any: Array<number>)); // Error
iFactory({}, 1, ...[]); // OK
iFactory({}, 1, ...[2]); // Error
iFactory({}, 1, ...(any: Array<number>)); // Error

class J extends React.Component<{children: ?number}, void> {}
const jFactory = React.createFactory(J);
jFactory({}); // Error
jFactory({}, undefined); // OK
jFactory({}, null); // OK
jFactory({}, 1); // OK
jFactory({}, 1, 2); // Error
jFactory({}, ...[]); // Error
jFactory({}, ...[1]); // OK
jFactory({}, ...[1, 2]); // Error
jFactory({}, ...(any: Array<number>)); // Error
jFactory({}, 1, ...[]); // OK
jFactory({}, 1, ...[2]); // Error
jFactory({}, 1, ...(any: Array<number>)); // Error

class K extends React.Component<{children: number}, void> {}
const kFactory = React.createFactory(K);
kFactory({}, 42); // OK
kFactory({children: 42}); // OK
kFactory({children: 42}, 42); // OK
kFactory({}, '42'); // Error
kFactory({children: '42'}); // Error
kFactory({children: '42'}, 42); // Error
kFactory({children: 42}, '42'); // Error
kFactory({children: '42'}, '42'); // Error

class L extends React.Component<{
  foo: number,
  bar: number,
  children: number,
}, void> {
  static defaultProps = {bar: 42};
}
const lFactory = React.createFactory(L);
lFactory({foo: 1, bar: 2}, 3); // OK
lFactory({foo: 1, bar: 2, children: 3}); // OK
lFactory({foo: 1}, 2); // OK
lFactory({foo: 1, children: 2}); // OK
lFactory({}, 1); // Error
lFactory({children: 1}); // Error
lFactory({bar: 1}, 2); // Error
lFactory({bar: 1, children: 2}); // Error
lFactory({foo: '1', bar: 2}, 3); // Error
lFactory({foo: '1', bar: 2, children: 3}); // Error
lFactory({foo: 1, bar: '2'}, 3); // Error
lFactory({foo: 1, bar: '2', children: 3}); // Error
lFactory({foo: 1, bar: 2}, '3'); // Error
lFactory({foo: 1, bar: 2, children: '3'}); // Error

class M extends React.Component<{}> {}
class N extends React.Component<{}> {}
const mFactory = React.createFactory(M);
(mFactory().type: typeof M); // OK
(mFactory().type: typeof N); // Error
