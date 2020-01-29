// @flow

const React = require('react');

function connect<A>(): void { }

type Foo = connect<number>;

function foo(Component: Foo) {
    <Component/>;
}
