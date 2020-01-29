//@flow

function identity<T>(x: T): T { return x }

identity<_>(3);
identity<_>('string');

declare function createObj<T>(): {x: T};

const x = createObj<_>();
x.x = 3;
x.x = "string";
