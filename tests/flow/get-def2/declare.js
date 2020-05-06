// @flow

declare var foo: number;
foo;

declare export var bar;
bar;

declare function baz(): void;
baz();

declare class Foo {};
new Foo();
