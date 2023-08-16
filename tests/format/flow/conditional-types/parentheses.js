// @flow

// #13275
type Foo<T> = T extends ((...a: any[]) => infer R extends string) ? R : never;
