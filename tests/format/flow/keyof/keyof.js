// @flow

type T1 = keyof Foo;
type T2 = keyof typeof obj;
type T3 = (keyof Foo)[];
type T4 = (keyof typeof obj)[];
type T5 = (keyof Foo)['bar'];
type T6 = (keyof typeof obj)['bar'];
type T7 = keyof Foo | string;
type T8 = keyof Foo & string;
type T9 = (typeof obj)[];
type T10 = (typeof obj)['bar'];
