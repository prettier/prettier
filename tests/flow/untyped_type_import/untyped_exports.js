type FooType = {foo: string};
let FooObj: FooType = {foo: "fooStr"};

type BarType = {bar: number};
let BarObj: BarType = {bar: 0};

export type {FooType};
export {FooObj};

export default BarObj;
