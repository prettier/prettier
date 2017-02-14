/**
 * @flow
 */

// TODO: adding an empty line should not be dropped.

declare module ModuleAliasFoo {
    declare type baz = number;
    declare type toz = string;
    declare function foo(bar : baz) : toz;
}
declare type Foo = string;
