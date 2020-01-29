// @flow

import React from 'react';

declare var any: any;

React.createElement(); // Error: Needs a minimum of two arguments.
React.createElement('div'); // OK
React.createElement(42); // Error: Number is not a valid component type.
React.createElement('div', {}); // OK
React.createElement(42, {}); // Error: Number is not a valid component type.
React.createElement({}, {}); // Error: Object is not a valid component type.
React.createElement(() => { return null }, {}); // OK

class A extends React.Component<{foo: number, bar: number}> {}
function B(props: {foo: number, bar: number}) { return null }

React.createElement(A, {foo: 1, bar: 2}); // OK
React.createElement(B, {foo: 1, bar: 2}); // OK
React.createElement(A, {
  foo: 42,
  bar: 'Hello, world!', // Error: `bar` is a string.
});
React.createElement(B, {
  foo: 42,
  bar: 'Hello, world!', // Error: `bar` is a string.
});
React.createElement(A, {foo: 42}); // Error: `bar` is missing.
React.createElement(B, {foo: 42}); // Error: `bar` is missing.
React.createElement(A, undefined); // Error: `foo` and `bar` are missing.
React.createElement(B, undefined); // Error: `foo` and `bar` are missing.
React.createElement(A, null); // Error: `foo` and `bar` are missing.
React.createElement(B, null); // Error: `foo` and `bar` are missing.
(React.createElement(A, {foo: 1, bar: 2}).type: Class<A>); // OK
(React.createElement(B, {foo: 1, bar: 2}).type: typeof B); // OK
(React.createElement(A, {foo: 1, bar: 2}).props.foo: number); // OK
(React.createElement(B, {foo: 1, bar: 2}).props.foo: number); // OK
(React.createElement(A, {foo: 1, bar: 2}).props.foo: boolean); // Error: `foo`
                                                               // is `number`.
(React.createElement(B, {foo: 1, bar: 2}).props.foo: boolean); // Error: `foo`
                                                               // is `number`.
React.createElement(A, {foo: 1, bar: 2}).nope; // Error: `nope` does not exist.
React.createElement(B, {foo: 1, bar: 2}).nope; // Error: `nope` does not exist.
React.createElement(A); // Error: Missing `foo` and `bar`.
React.createElement(B); // Error: Missing `foo` and `bar`.

class C extends React.Component<{foo: number, bar: number}> {
  static defaultProps = {bar: 42};
}
function D(props: {foo: number, bar: number}) { return null }
D.defaultProps = {bar: 42};

React.createElement(C, {foo: 1, bar: 2}); // OK
React.createElement(D, {foo: 1, bar: 2}); // OK
React.createElement(C, {
  foo: 42,
  bar: 'Hello, world!', // Error: `bar` is a string.
});
React.createElement(D, {
  foo: 42,
  bar: 'Hello, world!', // Error: `bar` is a string.
});
React.createElement(C, {foo: 42}); // OK: `bar` is in `defaultProps`.
React.createElement(D, {foo: 42}); // OK: `bar` is in `defaultProps`.
(React.createElement(C, {foo: 42}).props.bar: number); // OK
(React.createElement(D, {foo: 42}).props.bar: number); // OK

React.createElement(any, {whateverYouWant: 'yes'}); // OK

class E extends React.Component<{children: number}> {}
React.createElement(E, {}); // Error
React.createElement(E, undefined); // Error
React.createElement(E, null); // Error
React.createElement(E, {}, 1); // OK
React.createElement(E, undefined, 1); // OK
React.createElement(E, null, 1); // OK
React.createElement(E, {}, 1, 2); // Error
React.createElement(E, undefined, 1, 2); // Error
React.createElement(E, null, 1, 2); // Error
React.createElement(E, {}, 1, 2, 3); // Error
React.createElement(E, {}, [1, 2]); // Error
React.createElement(E, {}, [1, 2], [3, 4]); // Error
React.createElement(E, {}, ...[]); // Error
React.createElement(E, {}, ...[1]); // OK
React.createElement(E, {}, ...[1, 2]); // Error
React.createElement(E, {}, ...(any: Array<number>)); // Error
React.createElement(E, {}, 1, ...[]); // OK
React.createElement(E, {}, 1, ...[2]); // Error
React.createElement(E, {}, 1, ...(any: Array<number>)); // Error

class F extends React.Component<{children: Array<number>}> {}
React.createElement(F, {}); // Error
React.createElement(F, undefined); // Error
React.createElement(F, null); // Error
React.createElement(F, {}, 1); // Error
React.createElement(F, undefined, 1); // Error
React.createElement(F, null, 1); // Error
React.createElement(F, {}, 1, 2); // OK
React.createElement(F, undefined, 1, 2); // OK
React.createElement(F, null, 1, 2); // OK
React.createElement(F, {}, 1, 2, 3); // OK
React.createElement(F, {}, [1, 2]); // OK
React.createElement(F, {}, [1, 2], [3, 4]); // Error
React.createElement(F, {}, ...[]); // Error
React.createElement(F, {}, ...[1]); // Error
React.createElement(F, {}, ...[1, 2]); // OK
React.createElement(F, {}, ...(any: Array<number>)); // Error
React.createElement(F, {}, 1, ...[]); // Error
React.createElement(F, {}, 1, ...[2]); // OK
React.createElement(F, {}, 1, ...(any: Array<number>)); // Error

class G extends React.Component<{children: number | Array<number>}> {}
React.createElement(G, {}); // Error
React.createElement(G, {}, 1); // OK
React.createElement(G, {}, 1, 2); // OK
React.createElement(G, {}, 1, 2, 3); // OK
React.createElement(G, {}, [1, 2]); // OK
React.createElement(G, {}, [1, 2], [3, 4]); // Error
React.createElement(G, {}, ...[]); // Error
React.createElement(G, {}, ...[1]); // OK
React.createElement(G, {}, ...[1, 2]); // OK
React.createElement(G, {}, ...(any: Array<number>)); // Error
React.createElement(G, {}, 1, ...[]); // OK
React.createElement(G, {}, 1, ...[2]); // OK
React.createElement(G, {}, 1, ...(any: Array<number>)); // OK

class G2 extends React.Component<{children?: number | Array<number>}> {}
React.createElement(G2, {}); // OK
React.createElement(G2, {}, 1); // OK
React.createElement(G2, {}, 1, 2); // OK
React.createElement(G2, {}, 1, 2, 3); // OK
React.createElement(G2, {}, [1, 2]); // OK
React.createElement(G2, {}, [1, 2], [3, 4]); // Error
React.createElement(G2, {}, ...[]); // OK
React.createElement(G2, {}, ...[1]); // OK
React.createElement(G2, {}, ...[1, 2]); // OK
React.createElement(G2, {}, ...(any: Array<number>)); // OK
React.createElement(G2, {}, 1, ...[]); // OK
React.createElement(G2, {}, 1, ...[2]); // OK
React.createElement(G2, {}, 1, ...(any: Array<number>)); // OK

type NumberArrayRecursive = number | Array<NumberArrayRecursive>;
class H extends React.Component<{children: NumberArrayRecursive}> {}
React.createElement(H, {}); // Error
React.createElement(H, {}, 1); // OK
React.createElement(H, {}, 1, 2); // OK
React.createElement(H, {}, 1, 2, 3); // OK
React.createElement(H, {}, [1, 2]); // OK
React.createElement(H, {}, [1, 2], [3, 4]); // OK
React.createElement(H, {}, ...[]); // Error
React.createElement(H, {}, ...[1]); // OK
React.createElement(H, {}, ...[1, 2]); // OK
React.createElement(H, {}, ...(any: Array<number>)); // Error
React.createElement(H, {}, 1, ...[]); // OK
React.createElement(H, {}, 1, ...[2]); // OK
React.createElement(H, {}, 1, ...(any: Array<number>)); // OK

class I extends React.Component<{children?: number}> {}
React.createElement(I, {}); // OK
React.createElement(I, {}, undefined); // OK
React.createElement(I, {}, null); // Error
React.createElement(I, {}, 1); // OK
React.createElement(I, {}, 1, 2); // Error
React.createElement(I, {}, ...[]); // OK
React.createElement(I, {}, ...[1]); // OK
React.createElement(I, {}, ...[1, 2]); // Error
React.createElement(I, {}, ...(any: Array<number>)); // Error
React.createElement(I, {}, 1, ...[]); // OK
React.createElement(I, {}, 1, ...[2]); // Error
React.createElement(I, {}, 1, ...(any: Array<number>)); // Error

class J extends React.Component<{children: ?number}> {}
React.createElement(J, {}); // Error
React.createElement(J, {}, undefined); // OK
React.createElement(J, {}, null); // OK
React.createElement(J, {}, 1); // OK
React.createElement(J, {}, 1, 2); // Error
React.createElement(J, {}, ...[]); // Error
React.createElement(J, {}, ...[1]); // OK
React.createElement(J, {}, ...[1, 2]); // Error
React.createElement(J, {}, ...(any: Array<number>)); // Error
React.createElement(J, {}, 1, ...[]); // OK
React.createElement(J, {}, 1, ...[2]); // Error
React.createElement(J, {}, 1, ...(any: Array<number>)); // Error

class K extends React.Component<{children: number}> {}
React.createElement(K, {}, 42); // OK
React.createElement(K, {children: 42}); // OK
React.createElement(K, {children: 42}, 42); // OK
React.createElement(K, {}, '42'); // Error
React.createElement(K, {children: '42'}); // Error
React.createElement(K, {children: '42'}, 42); // Error
React.createElement(K, {children: 42}, '42'); // Error
React.createElement(K, {children: '42'}, '42'); // Error

class L extends React.Component<{
  foo: number,
  bar: number,
  children: number,
}> {
  static defaultProps = {bar: 42};
}
React.createElement(L, {foo: 1, bar: 2}, 3); // OK
React.createElement(L, {foo: 1, bar: 2, children: 3}); // OK
React.createElement(L, {foo: 1}, 2); // OK
React.createElement(L, {foo: 1, children: 2}); // OK
React.createElement(L, {}, 1); // Error
React.createElement(L, {children: 1}); // Error
React.createElement(L, {bar: 1}, 2); // Error
React.createElement(L, {bar: 1, children: 2}); // Error
React.createElement(L, {foo: '1', bar: 2}, 3); // Error
React.createElement(L, {foo: '1', bar: 2, children: 3}); // Error
React.createElement(L, {foo: 1, bar: '2'}, 3); // Error
React.createElement(L, {foo: 1, bar: '2', children: 3}); // Error
React.createElement(L, {foo: 1, bar: 2}, '3'); // Error
React.createElement(L, {foo: 1, bar: 2, children: '3'}); // Error

class M extends React.Component<{}> {}
class N extends React.Component<{}> {}
(React.createElement(M).type: typeof M); // OK
(React.createElement(M).type: typeof N); // Error
