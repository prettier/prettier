// @flow

type Foo = {foo: number};

declare var x: Foo;
declare var mixed: mixed;
declare var any: any;
declare var empty: empty;
declare var maybe: ?Foo;
declare var union: Foo | null | void;

(x?.foo: ?number); // no error, lint
(mixed?.foo: ?number); // error, no lint
(any?.foo: ?number); // no error, no lint
(empty?.foo: ?number); // no error, no lint
(maybe?.foo: ?number); // no error, no lint
(union?.foo: ?number); // no error, no lint
