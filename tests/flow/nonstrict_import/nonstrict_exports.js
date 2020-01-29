/* @flow */

type FooType = {foo: string};
const FooObj: FooType = {foo: "fooStr"};

type BarType = {bar: number};
const BarObj: BarType = {bar: 0};

type BazType = {baz: boolean};
const BazObj: BazType = {baz: true};

export type S = string;

export {FooObj};
export {BazObj};

export default BarObj;
