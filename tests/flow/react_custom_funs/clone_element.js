// @flow

import React from 'react';
import type {Element} from 'react';

declare var any: any;

class A extends React.Component<{foo: number}, void> {}
class B extends React.Component<{foo: number, bar: number}, void> {}
class C extends React.Component<{children: number}, void> {}
class D extends React.Component<{children: Array<number>}, void> {}
class E extends React.Component<{foo: number, bar: number}, void> {
  static defaultProps = {bar: 42};
}

declare var a: Element<Class<A>>;
declare var b: Element<Class<B>>;
declare var c: Element<Class<C>>;
declare var d: Element<Class<D>>;
declare var e: Element<Class<E>>;

React.cloneElement(); // Error: Needs a minimum of two arguments.
React.cloneElement('nope'); // Error: Not a valid element type.
React.cloneElement({ type: any }); // Error: Not a valid element type.
React.cloneElement(a); // OK: `a` is an element.

(React.cloneElement(a).type: Class<A>); // OK: `a` has a type of `A`.
(React.cloneElement(a).type: Class<B>); // Error: `a` has a type of `A`.
(React.cloneElement(a).props.foo: number); // OK
(React.cloneElement(a).props.bar: empty); // Error: `bar` does not exist.
(React.cloneElement(a).props.foo: string); // Error: `foo` is number.
(React.cloneElement(b).props.foo: number); // OK
(React.cloneElement(b).props.bar: number); // OK
(React.cloneElement(b).props.foo: string); // Error: `foo` is number.

React.cloneElement(a, {}); // OK
React.cloneElement(a, undefined); // OK
React.cloneElement(a, null); // OK
React.cloneElement(a, {foo: 1}); // OK
React.cloneElement(a, {foo: 1, bar: 2}); // OK
React.cloneElement(a, {foo: '1'}); // Error: `foo` is a number.
React.cloneElement(b, {}); // OK
React.cloneElement(b, undefined); // OK
React.cloneElement(b, null); // OK
React.cloneElement(b, {foo: 1}); // OK
React.cloneElement(b, {foo: 1, bar: 2}); // OK
React.cloneElement(b, {foo: '1'}); // Error: `foo` is a number.

React.cloneElement(c, {}); // OK
React.cloneElement(c, undefined); // OK
React.cloneElement(c, null); // OK
React.cloneElement(c, {children: 42}); // OK
React.cloneElement(c, {children: '42'}); // Error: `children` is a number.
React.cloneElement(c, {}, 42); // OK
React.cloneElement(c, undefined, 42); // OK
React.cloneElement(c, null, 42); // OK
React.cloneElement(c, {}, 1, 2, 3); // Error: `children` is not an array.
React.cloneElement(c, undefined, 1, 2, 3); // Error: `children` is not an array.
React.cloneElement(c, null, 1, 2, 3); // Error: `children` is not an array.
React.cloneElement(c, {}, ...[]); // OK

React.cloneElement(d, {}); // OK
React.cloneElement(d, {children: 42}); // Error: `children` is an array.
React.cloneElement(d, {children: [1, 2, 3]}); // OK
React.cloneElement(d, {}, 42); // Error: `children` is an array.
React.cloneElement(d, undefined, 42); // Error: `children` is an array.
React.cloneElement(d, null, 42); // Error: `children` is an array.
React.cloneElement(d, {}, 1, 2, 3); // OK
React.cloneElement(d, undefined, 1, 2, 3); // OK
React.cloneElement(d, null, 1, 2, 3); // OK

React.cloneElement(e, {}); // OK
React.cloneElement(e, {foo: 1}); // OK
React.cloneElement(e, {foo: 1, bar: 2}); // OK
React.cloneElement(e, {foo: undefined, bar: 2}); // Error: undefined ~> number
React.cloneElement(e, {foo: 1, bar: undefined}); // OK: `bar` has a default.

function SFC(props: { p: number }) { return null };
React.cloneElement(<SFC p={0} />, { p: "bad" }); // Error: string ~> number
